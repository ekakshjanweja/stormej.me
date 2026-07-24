/**
 * Shared types for real-time features
 * Single source of truth for both frontend and backend
 */

import { z } from "zod";

// ============================================================================
// Zod Schemas (for runtime validation)
// ============================================================================

export const messageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  text: z.string().max(500),
  color: z.string(),
  timestamp: z.number(),
});

export const cursorMessageSchema = z.object({
  text: z.string(),
  timestamp: z.number(),
});

export const cursorAnchorSchema = z.object({
  selector: z.string(),
  relativeX: z.number(),
  relativeY: z.number(),
});

export const cursorPositionSchema = z.object({
  userId: z.string(),
  name: z.string(),
  color: z.string(),
  // Anchor can be null, undefined, or a valid anchor object
  anchor: cursorAnchorSchema.nullable().optional(),
  // Note: percentX/percentY can be slightly outside 0-1 when cursor is near viewport edges
  percentX: z.number(),
  percentY: z.number(),
  scrollX: z.number(),
  scrollY: z.number(),
  lastUpdate: z.number(),
  // currentTyping can be null, undefined, or a string
  currentTyping: z.string().max(100).nullable().optional(),
  messages: z.array(cursorMessageSchema),
  path: z.string(),
});

// Event schemas
export const cursorEventSchema = z.object({
  type: z.literal("cursor"),
  payload: cursorPositionSchema,
});

export const messageEventSchema = z.object({
  type: z.literal("message"),
  payload: messageSchema,
});

export const userJoinEventSchema = z.object({
  type: z.literal("user_join"),
  payload: z.object({
    userId: z.string(),
    name: z.string(),
    color: z.string(),
  }),
});

export const userLeaveEventSchema = z.object({
  type: z.literal("user_leave"),
  payload: z.object({
    userId: z.string(),
  }),
});

export const initEventSchema = z.object({
  type: z.literal("init"),
  payload: z.object({
    messages: z.array(messageSchema),
    cursors: z.array(cursorPositionSchema),
  }),
});

export const pingEventSchema = z.object({
  type: z.literal("ping"),
});

export const pongEventSchema = z.object({
  type: z.literal("pong"),
});

export const realtimeEventSchema = z.discriminatedUnion("type", [
  cursorEventSchema,
  messageEventSchema,
  userJoinEventSchema,
  userLeaveEventSchema,
  initEventSchema,
  pongEventSchema,
]);

// Client-to-server events (subset that clients can send)
export const clientEventSchema = z.discriminatedUnion("type", [
  cursorEventSchema,
  messageEventSchema,
  userJoinEventSchema,
  userLeaveEventSchema,
  pingEventSchema,
]);

// ============================================================================
// TypeScript Types (derived from schemas)
// ============================================================================

export type Message = z.infer<typeof messageSchema>;

export type CursorMessage = z.infer<typeof cursorMessageSchema>;

export type CursorAnchor = z.infer<typeof cursorAnchorSchema>;

export type CursorPosition = z.infer<typeof cursorPositionSchema>;

export type RealtimeEvent = z.infer<typeof realtimeEventSchema>;

export type ClientEvent = z.infer<typeof clientEventSchema>;

export type UserJoinPayload = z.infer<typeof userJoinEventSchema>["payload"];
