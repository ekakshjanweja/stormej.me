// Backend-specific bindings. Shared realtime types live in @stormej/shared.
export interface Env {
	ALLOW_SIGNUP?: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	CORS_ORIGIN?: string;
	DB: D1Database;
	REALTIME_ROOM: DurableObjectNamespace;
	STORAGE_BUCKET: R2Bucket;
}
