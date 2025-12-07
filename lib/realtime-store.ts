// In-memory store for real-time features (chat messages + cursor positions)
// This data is ephemeral and will be cleared on server restart

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

// Element anchor for cross-device cursor positioning
export interface CursorAnchor {
  selector: string; // CSS selector (e.g., "[data-cursor-anchor='hero']")
  relativeX: number; // 0-1 position within element's width
  relativeY: number; // 0-1 position within element's height
}

export interface CursorPosition {
  userId: string;
  name: string;
  color: string;
  // Element-based positioning (preferred for cross-device)
  anchor?: CursorAnchor;
  // Fallback: percentage of viewport dimensions (0-1)
  percentX: number;
  percentY: number;
  lastUpdate: number;
  currentTyping?: string; // What user is currently typing
  messages: CursorMessage[]; // Last 3 sent messages
  path: string; // Current route path for filtering
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

// Use globalThis to persist store across hot reloads in dev mode
interface RealtimeStore {
  messages: Message[];
  cursors: Map<string, CursorPosition>;
  clients: Set<(event: RealtimeEvent) => void>;
}

declare global {
  // eslint-disable-next-line no-var
  var realtimeStore: RealtimeStore | undefined;
}

const MAX_MESSAGES = 50;

// Initialize or reuse existing store
function getStore(): RealtimeStore {
  if (!globalThis.realtimeStore) {
    globalThis.realtimeStore = {
      messages: [],
      cursors: new Map(),
      clients: new Set(),
    };
  }
  return globalThis.realtimeStore;
}

// Message functions
export function addMessage(message: Message): void {
  const store = getStore();
  store.messages.push(message);
  if (store.messages.length > MAX_MESSAGES) {
    store.messages.shift();
  }
  broadcast({ type: "message", payload: message });
}

export function getMessages(): Message[] {
  return [...getStore().messages];
}

// Cursor functions
export function updateCursor(cursor: CursorPosition): void {
  const store = getStore();
  store.cursors.set(cursor.userId, cursor);
  broadcast({ type: "cursor", payload: cursor });
}

export function removeCursor(userId: string): void {
  const store = getStore();
  store.cursors.delete(userId);
  broadcast({ type: "user_leave", payload: { userId } });
}

export function getCursors(): CursorPosition[] {
  return Array.from(getStore().cursors.values());
}

// Client management
export function addClient(
  callback: (event: RealtimeEvent) => void
): () => void {
  const store = getStore();
  store.clients.add(callback);

  // Send initial state
  callback({
    type: "init",
    payload: {
      messages: getMessages(),
      cursors: getCursors(),
    },
  });

  // Return cleanup function
  return () => {
    store.clients.delete(callback);
  };
}

export function broadcast(event: RealtimeEvent): void {
  const store = getStore();
  store.clients.forEach((callback) => {
    try {
      callback(event);
    } catch (error) {
      console.error("Error broadcasting to client:", error);
    }
  });
}

// Cleanup stale cursors (called periodically)
export function cleanupStaleCursors(maxAge: number = 10000): void {
  const store = getStore();
  const now = Date.now();
  const staleUserIds: string[] = [];

  store.cursors.forEach((cursor, cursorUserId) => {
    if (now - cursor.lastUpdate > maxAge) {
      staleUserIds.push(cursorUserId);
    }
  });

  staleUserIds.forEach((cursorUserId) => {
    removeCursor(cursorUserId);
  });
}

// Generate random identity
const adjectives = [
  "swift",
  "silent",
  "cosmic",
  "lunar",
  "stellar",
  "neon",
  "cyber",
  "pixel",
  "mystic",
  "shadow",
  "golden",
  "crystal",
  "frost",
  "ember",
  "storm",
  "zen",
  "vivid",
  "bold",
  "wild",
  "calm",
  "bright",
  "dark",
  "cool",
  "warm",
];

const animals = [
  "panda",
  "fox",
  "wolf",
  "hawk",
  "raven",
  "tiger",
  "lynx",
  "bear",
  "owl",
  "eagle",
  "shark",
  "whale",
  "cobra",
  "dragon",
  "phoenix",
  "falcon",
  "panther",
  "jaguar",
  "viper",
  "mantis",
  "crane",
  "turtle",
  "rabbit",
  "deer",
];

const colors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

export function generateRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adjective}-${animal}`;
}

export function generateRandomColor(): string {
  return colors[Math.floor(Math.random() * colors.length)];
}

export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
