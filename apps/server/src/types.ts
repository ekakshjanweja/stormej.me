// Re-export all types from shared package
export type {
	ClientEvent,
	CursorAnchor,
	CursorMessage,
	CursorPosition,
	Message,
	RealtimeEvent,
} from "@stormej/shared/types/realtime";

// Re-export schemas for validation
export {
	clientEventSchema,
	cursorPositionSchema,
	messageSchema,
	realtimeEventSchema,
} from "@stormej/shared/types/realtime";

// Backend-specific types
export interface Env {
	ALLOW_SIGNUP?: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	CORS_ORIGIN?: string;
	DB: D1Database;
	REALTIME_ROOM: DurableObjectNamespace;
	STORAGE_BUCKET: R2Bucket;
}
