import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";
import { WSContext } from "hono/ws";

const app = new Hono();

// --- Types (Mirrored from frontend) ---
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

// --- State ---
const MAX_MESSAGES = 50;
const messages: Message[] = [];
const cursors = new Map<string, CursorPosition>();
const clients = new Map<WSContext, string>(); // ws -> userId

// --- Helper Functions ---
function broadcast(event: RealtimeEvent, excludeWs?: WSContext) {
  const data = JSON.stringify(event);
  for (const [ws] of clients) {
    if (ws === excludeWs) continue;
    try {
      ws.send(data);
    } catch (e) {
      console.error("Error broadcasting:", e);
    }
  }
}

// --- Routes ---
app.get("/", (c) => {
  return c.text("Realtime WebSocket Server is running!");
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen(event: Event, ws: WSContext) {
        // Send initial state
        const initEvent: RealtimeEvent = {
          type: "init",
          payload: {
            messages: [...messages],
            cursors: Array.from(cursors.values()),
          },
        };
        ws.send(JSON.stringify(initEvent));
      },
      onMessage(event: MessageEvent, ws: WSContext) {
        try {
          const data = JSON.parse(event.data as string) as RealtimeEvent;

          switch (data.type) {
            case "cursor":
              // Update cursor state
              cursors.set(data.payload.userId, data.payload);
              // Associate ws with userId for cleanup
              clients.set(ws, data.payload.userId);
              // Broadcast to others
              broadcast(data, ws);
              break;

            case "message":
              // Add message to history
              messages.push(data.payload);
              if (messages.length > MAX_MESSAGES) {
                messages.shift();
              }
              // Broadcast to others
              broadcast(data, ws);
              break;

            case "user_join":
              // Broadcast to others
              broadcast(data, ws);
              break;

            case "user_leave":
              cursors.delete(data.payload.userId);
              clients.delete(ws);
              broadcast(data, ws);
              break;
          }
        } catch (e) {
          console.error("Error parsing message:", e);
        }
      },
      onClose(event: CloseEvent, ws: WSContext) {
        const userId = clients.get(ws);
        if (userId) {
          cursors.delete(userId);
          clients.delete(ws);
          broadcast({ type: "user_leave", payload: { userId } });
        }
      },
    };
  })
);

export default app;
