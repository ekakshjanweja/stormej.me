import { createAuth } from "@stormej/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
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
