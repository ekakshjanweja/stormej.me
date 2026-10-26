// Backend-specific bindings. Shared realtime types live in @stormej/shared.
export interface Env {
	ALLOW_SIGNUP?: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	CORS_ORIGIN?: string;
	DB: D1Database;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	REALTIME_ROOM: DurableObjectNamespace;
	/** the spotify app's id; a default is built in, it isn't secret */
	SPOTIFY_CLIENT_ID?: string;
	/** without this and the refresh token, /spotify answers configured: false */
	SPOTIFY_CLIENT_SECRET?: string;
	/** from apps/lab's `bun run spotify:token`; lasts 180 days */
	SPOTIFY_REFRESH_TOKEN?: string;
	STORAGE_BUCKET: R2Bucket;
	/** long random secret only you know — unlocks /vault via HttpOnly cookie */
	VAULT_ACCESS_KEY: string;
}
