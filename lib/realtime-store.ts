// Types and helper functions for real-time features
// The actual state is now managed by the Hono backend

export type Message = {
  id: string;
  userId: string;
  name: string;
  text: string;
  color: string;
  timestamp: number;
};

export type CursorMessage = {
  text: string;
  timestamp: number;
};

export type CursorAnchor = {
  selector: string;
  relativeX: number;
  relativeY: number;
};

export type CursorPosition = {
  userId: string;
  name: string;
  color: string;
  anchor?: CursorAnchor;
  percentX: number;
  percentY: number;
  scrollX: number;
  scrollY: number;
  lastUpdate: number;
  currentTyping?: string;
  messages: CursorMessage[];
  path: string;
};

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
  "chai",
  "masala",
  "jalebi",
  "bollywood",
  "desi",
  "samosa",
  "tandoori",
  "spicy",
  "mango",
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
  "mongoose",
  "peacock",
  "langur",
  "elephant",
  "rhino",
  "nilgai",
  "chital",
];

// Cursor colors harmonized with the app's blue-gray theme (hue 250)
// These work well in both light and dark mode while remaining distinct
const colors = [
  "#6366f1", // Indigo - primary accent
  "#8b5cf6", // Violet
  "#a78bfa", // Light violet
  "#c084fc", // Purple
  "#e879f9", // Fuchsia
  "#f472b6", // Pink
  "#38bdf8", // Sky blue
  "#22d3ee", // Cyan
  "#2dd4bf", // Teal
  "#4ade80", // Emerald
  "#a3e635", // Lime
  "#fbbf24", // Amber
  "#fb923c", // Orange
  "#f87171", // Red
  "#818cf8", // Periwinkle
  "#7dd3fc", // Light sky
  "#5eead4", // Light teal
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
