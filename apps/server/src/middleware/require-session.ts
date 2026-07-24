import { createAuth } from "@stormej/auth";
import { createMiddleware } from "hono/factory";
import type { Env } from "../types";

/**
 * Rejects the request unless better-auth recognises the session cookie. Vault
 * writes sit behind this; reads of /files/* stay public.
 */
export const requireSession = createMiddleware<{ Bindings: Env }>(
	async (c, next) => {
		const session = await createAuth(c.env).api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		return next();
	}
);
