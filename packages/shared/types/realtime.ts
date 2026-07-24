/**
 * Shared types for real-time features
 * Single source of truth for both frontend and backend
 */

import { z } from "zod";

// ============================================================================
// Zod Schemas (for runtime validation)
// ============================================================================

export const messageSchema = z.object({
	color: z.string(),
	id: z.string(),
	name: z.string(),
	text: z.string().max(500),
	timestamp: z.number(),
	userId: z.string(),
});

export const cursorMessageSchema = z.object({
	text: z.string(),
	timestamp: z.number(),
});

export const cursorAnchorSchema = z.object({
	relativeX: z.number(),
	relativeY: z.number(),
	selector: z.string(),
});

export const cursorPositionSchema = z.object({
	// Anchor can be null, undefined, or a valid anchor object
	anchor: cursorAnchorSchema.nullable().optional(),
	color: z.string(),
	// currentTyping can be null, undefined, or a string
	currentTyping: z.string().max(100).nullable().optional(),
	lastUpdate: z.number(),
	messages: z.array(cursorMessageSchema),
	name: z.string(),
	path: z.string(),
	// Note: percentX/percentY can be slightly outside 0-1 when cursor is near viewport edges
	percentX: z.number(),
	percentY: z.number(),
	scrollX: z.number(),
	scrollY: z.number(),
	userId: z.string(),
});

// Event schemas
export const cursorEventSchema = z.object({
	payload: cursorPositionSchema,
	type: z.literal("cursor"),
});

export const messageEventSchema = z.object({
	payload: messageSchema,
	type: z.literal("message"),
});

export const userJoinEventSchema = z.object({
	payload: z.object({
		color: z.string(),
		name: z.string(),
		userId: z.string(),
	}),
	type: z.literal("user_join"),
});

export const userLeaveEventSchema = z.object({
	payload: z.object({
		userId: z.string(),
	}),
	type: z.literal("user_leave"),
});

export const initEventSchema = z.object({
	payload: z.object({
		cursors: z.array(cursorPositionSchema),
		messages: z.array(messageSchema),
	}),
	type: z.literal("init"),
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
