import {
	DEFAULT_COLORS,
	normalizeColors,
	type SiteColors,
} from "./site-colors";

export const COLORS_CACHE_TAG = "site-colors";

const COLORS_REVALIDATE_SECONDS = 600;
const COLORS_FETCH_TIMEOUT_MS = 2000;
const TRAILING_SLASH = /\/$/;

/** Same resolution as the rewrites in next.config.mjs. */
export function workerOrigin() {
	const configured = process.env.NEXT_PUBLIC_WORKER_URL;
	if (configured) {
		return configured.replace(TRAILING_SLASH, "");
	}
	return process.env.NODE_ENV === "development"
		? "http://localhost:8787"
		: "https://stormej.jekaksh.workers.dev";
}

/**
 * The palette published from the vault, cached under COLORS_CACHE_TAG so a
 * publish can drop it. Any failure falls back to the built-in palette, so a
 * worker outage never takes the site down with it.
 */
export async function getSiteColors(): Promise<SiteColors> {
	try {
		const response = await fetch(`${workerOrigin()}/colors`, {
			next: { revalidate: COLORS_REVALIDATE_SECONDS, tags: [COLORS_CACHE_TAG] },
			signal: AbortSignal.timeout(COLORS_FETCH_TIMEOUT_MS),
		});
		if (!response.ok) {
			return DEFAULT_COLORS;
		}
		const body = (await response.json()) as { colors?: unknown };
		return body.colors ? normalizeColors(body.colors) : DEFAULT_COLORS;
	} catch {
		return DEFAULT_COLORS;
	}
}
