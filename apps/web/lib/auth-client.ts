import { createAuthClient } from "better-auth/react";

/**
 * The worker owns better-auth, but next rewrites /api/auth/* to it (see
 * next.config.mjs), so the browser always talks to its own origin and the
 * session cookie stays first party.
 *
 * better-auth parses this at module scope, including during the prerender pass,
 * so it has to be absolute even on the server where there is no origin yet.
 */
function authBaseUrl() {
	if (typeof window !== "undefined") {
		return `${window.location.origin}/api/auth`;
	}

	const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
	if (vercelUrl) {
		return `https://${vercelUrl}/api/auth`;
	}

	return process.env.NODE_ENV === "development"
		? "http://localhost:3000/api/auth"
		: "https://www.stormej.me/api/auth";
}

export const authClient = createAuthClient({
	baseURL: authBaseUrl(),
});

export const { signIn, signOut, useSession, getSession } = authClient;
