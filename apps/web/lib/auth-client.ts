import { createAuthClient } from "better-auth/react";

/**
 * The worker owns better-auth, but next rewrites /api/auth/* to it (see
 * next.config.mjs), so the browser always talks to its own origin and the
 * session cookie stays first party.
 */
export const authClient = createAuthClient({
	baseURL: "/api/auth",
});

export const { signIn, signOut, useSession, getSession } = authClient;
