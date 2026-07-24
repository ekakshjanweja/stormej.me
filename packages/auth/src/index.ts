import { createDb } from "@stormej/db";
import * as schema from "@stormej/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export interface AuthEnv {
	/** set to "true" only while seeding the first user, then remove it */
	ALLOW_SIGNUP?: string;
	BETTER_AUTH_SECRET: string;
	/** origin the browser sees, e.g. https://www.stormej.me */
	BETTER_AUTH_URL: string;
	/** comma separated list of origins allowed to call the auth endpoints */
	CORS_ORIGIN?: string;
	DB: D1Database;
}

const parseOrigins = (value?: string) =>
	value
		?.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean) ?? [];

export function createAuth(env: AuthEnv) {
	return betterAuth({
		basePath: "/api/auth",
		baseURL: env.BETTER_AUTH_URL,
		database: drizzleAdapter(createDb(env.DB), {
			provider: "sqlite",
			schema,
		}),
		emailAndPassword: {
			// the vault is single user. signup stays closed unless explicitly opened
			// to seed the first account.
			disableSignUp: env.ALLOW_SIGNUP !== "true",
			enabled: true,
		},
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: parseOrigins(env.CORS_ORIGIN),
	});
}

export type Auth = ReturnType<typeof createAuth>;
