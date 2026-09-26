import { Hono } from "hono";
import { requireSession } from "../../middleware/require-session";
import type { Env } from "../../types";

/** Lives under a prefix the /files routes can never serve (keys there reject "/"). */
export const DESIGN_KEY = "_config/site-design.json";
const MAX_DESIGN_BYTES = 32 * 1024;

export const designRoutes = new Hono<{ Bindings: Env }>();

const readDesign = async (bucket: R2Bucket) => {
	const object = await bucket.get(DESIGN_KEY);
	if (!object) {
		return { design: null, updatedAt: null };
	}
	return {
		design: (await object.json()) as unknown,
		updatedAt: object.uploaded.toISOString(),
	};
};

// public: the web app renders whatever was last published
designRoutes.get("/design", async (c) => {
	c.header("Cache-Control", "no-store");
	return c.json(await readDesign(c.env.STORAGE_BUCKET));
});

designRoutes.use("/admin/design", requireSession);

designRoutes.get("/admin/design", async (c) =>
	c.json(await readDesign(c.env.STORAGE_BUCKET))
);

designRoutes.put("/admin/design", async (c) => {
	const text = await c.req.text();
	if (text.length > MAX_DESIGN_BYTES) {
		return c.json({ error: "design is too large" }, 413);
	}

	let body: { design?: unknown } | null = null;
	try {
		body = JSON.parse(text) as { design?: unknown };
	} catch {
		return c.json({ error: "design must be json" }, 400);
	}

	// the web app validates every field before it ever reaches css; here we
	// only make sure it is an object worth storing
	if (!body?.design || typeof body.design !== "object") {
		return c.json({ error: "missing design" }, 400);
	}

	const object = await c.env.STORAGE_BUCKET.put(
		DESIGN_KEY,
		JSON.stringify(body.design),
		{ httpMetadata: { contentType: "application/json" } }
	);

	return c.json({
		ok: true,
		updatedAt: object?.uploaded.toISOString() ?? null,
	});
});
