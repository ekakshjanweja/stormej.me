// Re-export all types from shared package
export type {
  Message,
  CursorMessage,
  CursorAnchor,
  CursorPosition,
  RealtimeEvent,
  ClientEvent,
} from "@shared/types/realtime";

// Re-export schemas for validation
export {
  messageSchema,
  cursorPositionSchema,
  realtimeEventSchema,
  clientEventSchema,
} from "@shared/types/realtime";

// Backend-specific types
export type Env = {
  REALTIME_ROOM: DurableObjectNamespace;
};
