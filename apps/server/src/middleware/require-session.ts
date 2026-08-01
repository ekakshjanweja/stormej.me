import { createAuth } from "@stormej/auth";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { VAULT_COOKIE, vaultGateValid } from "../lib/vault-gate";
import type { Env } from "../types";

/**
 * Vault writes need either a valid vault-gate cookie (the private access key)
 * or a better-auth session. Public /files/* stays open.
 */
export const requireSession = createMiddleware<{ Bindings: Env }>(
	async (c, next) => {
		if (
			c.env.VAULT_ACCESS_KEY &&
			vaultGateValid(getCookie(c, VAULT_COOKIE), c.env.VAULT_ACCESS_KEY)
		) {
			return next();
		}

		const session = await createAuth(c.env).api.getSession({
			headers: c.req.raw.headers,
		});

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		return next();
	}
);
