// Types and helper functions for real-time features
// The actual state is now managed by the Hono backend

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
