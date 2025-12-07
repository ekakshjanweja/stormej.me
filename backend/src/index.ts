import { Hono } from "hono";
import { cors } from "hono/cors";

// --- Types ---
export interface Message {
  id: string;
  userId: string;
  name: string;
  text: string;
  color: string;
  timestamp: number;
}

export interface CursorMessage {
  text: string;
  timestamp: number;
}

export interface CursorAnchor {
  selector: string;
  relativeX: number;
  relativeY: number;
}

export interface CursorPosition {
  userId: string;
  name: string;
  color: string;
  anchor?: CursorAnchor;
  percentX: number;
  percentY: number;
  lastUpdate: number;
  currentTyping?: string;
  messages: CursorMessage[];
  path: string;
}

export type RealtimeEvent =
  | { type: "message"; payload: Message }
  | { type: "cursor"; payload: CursorPosition }
  | {
      type: "user_join";
      payload: { userId: string; name: string; color: string };
    }
  | { type: "user_leave"; payload: { userId: string } }
  | {
      type: "init";
      payload: { messages: Message[]; cursors: CursorPosition[] };
    };

// --- Durable Object for WebSocket connections ---
export class RealtimeRoom implements DurableObject {
  private state: DurableObjectState;
  private cursors: Map<string, CursorPosition> = new Map();
  private messages: Message[] = [];
  private readonly MAX_MESSAGES = 50;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
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

          this.broadcast(data, ws);
          break;

        case "user_join":
          ws.serializeAttachment({ userId: data.payload.userId });
          this.broadcast(data, ws);
          break;

        case "user_leave":
          this.cursors.delete(data.payload.userId);
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

// --- Env interface ---
interface Env {
  REALTIME_ROOM: DurableObjectNamespace;
}

// --- Hono App ---
const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "*" }));

app.get("/health", (c) => c.text("OK"));

app.all("/ws", async (c) => {
  const id = c.env.REALTIME_ROOM.idFromName("global");
  const room = c.env.REALTIME_ROOM.get(id);
  return room.fetch(c.req.raw);
});

app.all("/", async (c) => {
  const id = c.env.REALTIME_ROOM.idFromName("global");
  const room = c.env.REALTIME_ROOM.get(id);
  return room.fetch(c.req.raw);
});

export default app;
