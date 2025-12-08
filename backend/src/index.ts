import { Hono } from "hono";
import { cors } from "hono/cors";
import { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "*" }));

app.get("/health", (c) => c.text("OK"));

app.all("/ws", async (c) => {
  const id = c.env.REALTIME_ROOM.idFromName("global");
  const room = c.env.REALTIME_ROOM.get(id);
  return room.fetch(c.req.raw);
});

app.all("/", async (c) => {
  const id = c.env.REALTIME_ROOM.idFromName("global");
  const room = c.env.REALTIME_ROOM.get(id);
  return room.fetch(c.req.raw);
});

export default app;
