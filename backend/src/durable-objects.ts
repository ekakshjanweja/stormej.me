import { Env, RealtimeEvent, CursorPosition, Message } from "./types";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

export class RealtimeRoom implements DurableObject {
  private state: DurableObjectState;
  private cursors: Map<string, CursorPosition> = new Map();
  private lastActivity: Map<string, number> = new Map(); // Track last activity per user
  private messages: Message[] = [];
  private readonly MAX_MESSAGES = 50;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    // Start cleanup interval
    this.startCleanupInterval();
  }

  private startCleanupInterval() {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveUsers();
    }, CLEANUP_INTERVAL_MS);
  }

  private cleanupInactiveUsers() {
    const now = Date.now();
    const inactiveUsers: string[] = [];

    // Find inactive users
    for (const [userId, lastTime] of this.lastActivity.entries()) {
      if (now - lastTime > INACTIVITY_TIMEOUT_MS) {
        inactiveUsers.push(userId);
      }
    }

    // Remove inactive users
    for (const userId of inactiveUsers) {
      console.log(`[RealtimeRoom] Removing inactive user: ${userId}`);
      this.cursors.delete(userId);
      this.lastActivity.delete(userId);

      // Broadcast user leave
      this.broadcast({ type: "user_leave", payload: { userId } });

      // Close their WebSocket if still connected
      const webSockets = this.state.getWebSockets();
      for (const ws of webSockets) {
        const meta = ws.deserializeAttachment() as { userId: string } | null;
        if (meta?.userId === userId) {
          try {
            ws.close(1000, "Inactive for 30 minutes");
          } catch (e) {
            // Ignore close errors
          }
        }
      }
    }

    if (inactiveUsers.length > 0) {
      console.log(
        `[RealtimeRoom] Cleaned up ${inactiveUsers.length} inactive users`
      );
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/ws" || url.pathname === "/") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.state.acceptWebSocket(server);

      console.log(`[RealtimeRoom] New connection`);

      // Send initial state
      const initEvent: RealtimeEvent = {
        type: "init",
        payload: {
          messages: [...this.messages],
          cursors: Array.from(this.cursors.values()),
        },
      };
      server.send(JSON.stringify(initEvent));

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response("Not found", { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const data = JSON.parse(message as string) as RealtimeEvent;

      switch (data.type) {
        case "cursor":
          this.cursors.set(data.payload.userId, data.payload);
          this.lastActivity.set(data.payload.userId, Date.now()); // Update activity
          ws.serializeAttachment({ userId: data.payload.userId });
          this.broadcast(data, ws);
          break;

        case "message":
          this.messages.push(data.payload);
          if (this.messages.length > this.MAX_MESSAGES) {
            this.messages.shift();
          }

          const senderCursor = this.cursors.get(data.payload.userId);
          if (senderCursor) {
            senderCursor.messages.push({
              text: data.payload.text,
              timestamp: data.payload.timestamp,
            });
            if (senderCursor.messages.length > 3) {
              senderCursor.messages.shift();
            }
            senderCursor.lastUpdate = Date.now();
            this.cursors.set(data.payload.userId, senderCursor);
          }
          this.lastActivity.set(data.payload.userId, Date.now()); // Update activity

          this.broadcast(data, ws);
          break;

        case "user_join":
          ws.serializeAttachment({ userId: data.payload.userId });
          this.lastActivity.set(data.payload.userId, Date.now()); // Track activity
          this.broadcast(data, ws);
          break;

        case "user_leave":
          this.cursors.delete(data.payload.userId);
          this.lastActivity.delete(data.payload.userId);
          this.broadcast(data, ws);
          break;
      }
    } catch (e) {
      console.error("[RealtimeRoom] Error parsing message:", e);
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string) {
    const meta = ws.deserializeAttachment() as { userId: string } | null;
    const userId = meta?.userId;

    if (userId) {
      this.cursors.delete(userId);
      this.lastActivity.delete(userId);
      this.broadcast({ type: "user_leave", payload: { userId } }, ws);
    }
  }

  async webSocketError(ws: WebSocket, error: unknown) {
    console.error("[RealtimeRoom] WebSocket error:", error);
  }

  private broadcast(event: RealtimeEvent, excludeWs?: WebSocket) {
    const data = JSON.stringify(event);
    const webSockets = this.state.getWebSockets();

    for (const ws of webSockets) {
      if (ws === excludeWs) continue;
      try {
        ws.send(data);
      } catch (e) {
        // Ignore send errors
      }
    }
  }
}
