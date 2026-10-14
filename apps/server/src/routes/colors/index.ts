import { Hono } from "hono";
import { requireSession } from "../../middleware/require-session";
import type { Env } from "../../types";

/** Under a prefix the /files routes can never serve (keys there reject "/"). */
const COLORS_KEY = "_config/site-colors.json";
const MAX_COLORS_BYTES = 4 * 1024;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const colorRoutes = new Hono<{ Bindings: Env }>();

const readColors = async (bucket: R2Bucket) => {
	const object = await bucket.get(COLORS_KEY);
	if (!object) {
		return { colors: null, updatedAt: null };
	}
	return {
		colors: (await object.json()) as unknown,
		updatedAt: object.uploaded.toISOString(),
	};
};

/** every leaf a #rrggbb string, two levels deep: { light: {...}, dark: {...} } */
const isColorSet = (value: unknown): boolean => {
	if (!value || typeof value !== "object") {
		return false;
	}
	return Object.values(value).every(
		(mode) =>
			Boolean(mode) &&
			typeof mode === "object" &&
			Object.values(mode as object).every(
				(colour) => typeof colour === "string" && HEX_COLOR.test(colour)
			)
	);
};

// public: the web app renders whatever was last published
colorRoutes.get("/colors", async (c) => {
	c.header("Cache-Control", "no-store");
	return c.json(await readColors(c.env.STORAGE_BUCKET));
});

colorRoutes.use("/admin/colors", requireSession);

colorRoutes.put("/admin/colors", async (c) => {
	const text = await c.req.text();
	if (text.length > MAX_COLORS_BYTES) {
		return c.json({ error: "colours are too large" }, 413);
	}

	let body: { colors?: unknown } | null = null;
	try {
		body = JSON.parse(text) as { colors?: unknown };
	} catch {
		return c.json({ error: "colours must be json" }, 400);
	}
	if (!isColorSet(body?.colors)) {
		return c.json({ error: "colours must be #rrggbb values" }, 400);
	}

	const object = await c.env.STORAGE_BUCKET.put(
		COLORS_KEY,
		JSON.stringify(body?.colors),
		{ httpMetadata: { contentType: "application/json" } }
	);
	return c.json({
		ok: true,
		updatedAt: object?.uploaded.toISOString() ?? null,
	});
});

// back to the built-in palette
colorRoutes.delete("/admin/colors", async (c) => {
	await c.env.STORAGE_BUCKET.delete(COLORS_KEY);
	return c.json({ ok: true });
});
