/**
 * Shared constants for real-time features
 * Centralizes all timing and configuration values to prevent duplication
 */

export const REALTIME_CONSTANTS = {
	/** How often to run inactive user cleanup (5 minutes) */
	CLEANUP_INTERVAL_MS: 5 * 60 * 1000,

	/** Minimum time between cursor position updates (~250fps) */
	CURSOR_THROTTLE_MS: 4,

	/** How often to send heartbeat updates (5 seconds) */
	HEARTBEAT_INTERVAL_MS: 5000,

	/** How long before a user is considered inactive (30 minutes) */
	INACTIVITY_TIMEOUT_MS: 30 * 60 * 1000,

	/** Maximum number of messages to retain in history */
	MAX_MESSAGES: 50,
	/** How long messages are displayed before they expire (30 seconds) */
	MESSAGE_EXPIRY_MS: 30_000,

	/** Ping interval to keep connection alive and detect stale connections */
	PING_INTERVAL_MS: 25_000,

	/** Initial reconnection delay */
	RECONNECT_INITIAL_MS: 1000,

	/** Maximum reconnection delay cap */
	RECONNECT_MAX_MS: 30_000,

	/** LocalStorage key for user identity */
	STORAGE_KEY: "stormej.realtime.identity",

	/** Delay before reconnecting when tab becomes visible (debounce) */
	VISIBILITY_RECONNECT_DELAY_MS: 100,
} as const;
