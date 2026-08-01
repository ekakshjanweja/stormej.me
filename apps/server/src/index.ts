import { createAuth } from "@stormej/auth";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import {
	keysMatch,
	sealVaultGate,
	VAULT_COOKIE,
	vaultCookieOptions,
} from "./lib/vault-gate";
import { uploadRoutes } from "./routes/upload";
import type { Env } from "./types";

const DEFAULT_ORIGINS = [
	"https://www.stormej.me",
	"https://stormej.me",
	"http://localhost:3000",
	"http://localhost:8787",
];

const app = new Hono<{ Bindings: Env }>();

app.use("*", (c, next) =>
	cors({
		allowHeaders: ["Authorization", "Content-Type"],
		allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
		origin: c.env.CORS_ORIGIN
			? c.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
			: DEFAULT_ORIGINS,
	})(c, next)
);

app.get("/health", (c) => c.text("OK"));

app.on(["GET", "POST"], "/api/auth/*", (c) =>
	createAuth(c.env).handler(c.req.raw)
);

// public gate — must stay outside /admin middleware
app.post("/admin/unlock", async (c) => {
	const expected = c.env.VAULT_ACCESS_KEY;
	if (!expected) {
		return c.json({ error: "Vault gate is not configured" }, 503);
	}

	const body = await c.req.json<{ key?: string }>().catch(() => null);
	const provided = body?.key?.trim() ?? "";
	if (!(provided && keysMatch(provided, expected))) {
		return c.json({ error: "wrong key. respectfully leave." }, 401);
	}

	const { cookieValue, maxAge } = sealVaultGate(expected);
	const secure = new URL(c.req.url).protocol === "https:";
	setCookie(c, VAULT_COOKIE, cookieValue, vaultCookieOptions(maxAge, secure));
	return c.json({ ok: true });
});

app.post("/admin/lock", (c) => {
	const secure = new URL(c.req.url).protocol === "https:";
	deleteCookie(c, VAULT_COOKIE, { path: "/", secure });
	return c.json({ ok: true });
});

app.route("/", uploadRoutes);

app.all("/ws", (c) => {
	const id = c.env.REALTIME_ROOM.idFromName("global");
	const room = c.env.REALTIME_ROOM.get(id);
	return room.fetch(c.req.raw);
});

app.all("/", (c) => {
	const id = c.env.REALTIME_ROOM.idFromName("global");
	const room = c.env.REALTIME_ROOM.get(id);
	return room.fetch(c.req.raw);
});

export default app;
// biome-ignore lint/performance/noBarrelFile: workerd resolves the durable object class off the entry module
export { RealtimeRoom } from "./durable-objects";
