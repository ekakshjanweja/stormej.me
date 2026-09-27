import { Hono } from "hono";
import { requireSession } from "../../middleware/require-session";
import type { Env } from "../../types";

/** Lives under a prefix the /files routes can never serve (keys there reject "/"). */
export const DESIGN_KEY = "_config/site-design.json";
const MAX_DESIGN_BYTES = 32 * 1024;

/** looks saved from the studio; private, only the vault ever reads them */
export const DESIGN_PRESETS_KEY = "_config/design-presets.json";
const MAX_PRESETS_BYTES = 512 * 1024;

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
designRoutes.use("/admin/design/presets", requireSession);

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

designRoutes.get("/admin/design/presets", async (c) => {
	c.header("Cache-Control", "no-store");
	const object = await c.env.STORAGE_BUCKET.get(DESIGN_PRESETS_KEY);
	return c.json({ presets: object ? ((await object.json()) as unknown) : [] });
});

// the studio sends the whole list each time; it is small and only one person
// edits it, so there is nothing to merge
designRoutes.put("/admin/design/presets", async (c) => {
	const text = await c.req.text();
	if (text.length > MAX_PRESETS_BYTES) {
		return c.json({ error: "too many saved presets" }, 413);
	}

	let body: { presets?: unknown } | null = null;
	try {
		body = JSON.parse(text) as { presets?: unknown };
	} catch {
		return c.json({ error: "presets must be json" }, 400);
	}

	// as with the design, the web app validates every preset before use
	if (!Array.isArray(body?.presets)) {
		return c.json({ error: "missing presets" }, 400);
	}

	await c.env.STORAGE_BUCKET.put(
		DESIGN_PRESETS_KEY,
		JSON.stringify(body.presets),
		{ httpMetadata: { contentType: "application/json" } }
	);

	return c.json({ ok: true });
});
