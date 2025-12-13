import {
  Env,
  RealtimeEvent,
  CursorPosition,
  Message,
  clientEventSchema,
} from "./types";
import { REALTIME_CONSTANTS } from "@shared/constants";

const {
  INACTIVITY_TIMEOUT_MS,
  CLEANUP_INTERVAL_MS,
  MAX_MESSAGES,
  MESSAGE_EXPIRY_MS,
} = REALTIME_CONSTANTS;

export class RealtimeRoom implements DurableObject {
  private state: DurableObjectState;
  private cursors: Map<string, CursorPosition> = new Map();
  private lastActivity: Map<string, number> = new Map();
  private messages: Message[] = [];
  private alarmScheduled: boolean = false;

  constructor(state: DurableObjectState, _env: Env) {
    this.state = state;
  }

  /**
   * Cloudflare's alarm API handler - replaces setInterval to prevent leaking
   * on Durable Object eviction
   */
  async alarm() {
    this.cleanupInactiveUsers();
    this.cleanupExpiredMessages();

    // Only reschedule if we still have active users
    if (this.cursors.size > 0 || this.lastActivity.size > 0) {
      await this.scheduleCleanupAlarm();
    } else {
      this.alarmScheduled = false;
    }
  }

  private async scheduleCleanupAlarm() {
    if (this.alarmScheduled) return;

    try {
      await this.state.storage.setAlarm(Date.now() + CLEANUP_INTERVAL_MS);
      this.alarmScheduled = true;
    } catch (e) {
      console.error("[RealtimeRoom] Failed to schedule alarm:", e);
    }
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

  private cleanupExpiredMessages() {
    const now = Date.now();
    let cleanedCount = 0;

    // Clean up global messages array
    const initialGlobalCount = this.messages.length;
    this.messages = this.messages.filter(
      (msg) => now - msg.timestamp < MESSAGE_EXPIRY_MS
    );
    cleanedCount += initialGlobalCount - this.messages.length;

    // Clean up messages in all cursor objects
    for (const [userId, cursor] of this.cursors.entries()) {
      const initialCursorCount = cursor.messages.length;
      cursor.messages = cursor.messages.filter(
        (msg) => now - msg.timestamp < MESSAGE_EXPIRY_MS
      );
      const removed = initialCursorCount - cursor.messages.length;
      if (removed > 0) {
        cleanedCount += removed;
        this.cursors.set(userId, cursor);
      }
    }

    if (cleanedCount > 0) {
      console.log(`[RealtimeRoom] Cleaned up ${cleanedCount} expired messages`);
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

      // Schedule cleanup alarm when we get connections
      await this.scheduleCleanupAlarm();

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
      const rawData = JSON.parse(message as string);

      // Validate incoming message using Zod schema
      const parseResult = clientEventSchema.safeParse(rawData);
      if (!parseResult.success) {
        console.error(
          "[RealtimeRoom] Invalid message:",
          parseResult.error.errors
        );
        return; // Silently drop invalid messages
      }

      const data = parseResult.data;

      switch (data.type) {
        case "cursor":
          // Merge cursor position with existing messages (don't overwrite messages)
          const existingCursor = this.cursors.get(data.payload.userId);
          const updatedCursor = {
            ...data.payload,
            messages: existingCursor?.messages || [],
          };
          this.cursors.set(data.payload.userId, updatedCursor);
          this.lastActivity.set(data.payload.userId, Date.now());
          ws.serializeAttachment({ userId: data.payload.userId });
          this.broadcast({ type: "cursor", payload: updatedCursor }, ws);
          break;

        case "message":
          this.messages.push(data.payload);
          if (this.messages.length > MAX_MESSAGES) {
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
          this.lastActivity.set(data.payload.userId, Date.now());

          this.broadcast(data, ws);
          break;

        case "user_join":
          ws.serializeAttachment({ userId: data.payload.userId });
          this.lastActivity.set(data.payload.userId, Date.now());
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

  async webSocketClose(ws: WebSocket, _code: number, _reason: string) {
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
