import { DEFAULT_DESIGN, type DesignConfig, normalizeDesign } from "./options";

export const DESIGN_CACHE_TAG = "site-design";

const DESIGN_REVALIDATE_SECONDS = 600;
const DESIGN_FETCH_TIMEOUT_MS = 2000;
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
 * The design published from the vault. Cached under DESIGN_CACHE_TAG so a
 * publish can invalidate it; any failure falls back to the default design so
 * a worker outage never takes the site down with it.
 */
export async function getPublishedDesign(): Promise<DesignConfig> {
	try {
		const response = await fetch(`${workerOrigin()}/design`, {
			next: { revalidate: DESIGN_REVALIDATE_SECONDS, tags: [DESIGN_CACHE_TAG] },
			signal: AbortSignal.timeout(DESIGN_FETCH_TIMEOUT_MS),
		});
		if (!response.ok) {
			return DEFAULT_DESIGN;
		}
		const body = (await response.json()) as { design?: unknown };
		return body.design ? normalizeDesign(body.design) : DEFAULT_DESIGN;
	} catch {
		return DEFAULT_DESIGN;
	}
}
