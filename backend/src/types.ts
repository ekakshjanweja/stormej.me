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

export type Env = {
  REALTIME_ROOM: DurableObjectNamespace;
};
