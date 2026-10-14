import { revalidateTag } from "next/cache";
import { normalizeColors } from "@/lib/site-colors";
import {
	COLORS_CACHE_TAG,
	getSiteColors,
	workerOrigin,
} from "@/lib/site-colors.server";

/**
 * Publish or reset the site colours from the vault. The worker does the auth
 * (it checks the vault cookie we forward) and storage; on success the cached
 * palette is dropped so the next request renders the new one.
 */
async function forward(request: Request, init: RequestInit) {
	const response = await fetch(`${workerOrigin()}/admin/colors`, {
		...init,
		cache: "no-store",
		headers: {
			"Content-Type": "application/json",
			cookie: request.headers.get("cookie") ?? "",
		},
	});
	if (!response.ok) {
		return new Response(await response.text(), {
			headers: {
				"Content-Type":
					response.headers.get("Content-Type") ?? "application/json",
			},
			status: response.status,
		});
	}
	// stale-while-revalidate would show the old colours once more; publish should be instant
	revalidateTag(COLORS_CACHE_TAG, { expire: 0 });
	return null;
}

export async function PUT(request: Request) {
	const body = (await request.json().catch(() => null)) as {
		colors?: unknown;
	} | null;
	if (!body?.colors) {
		return Response.json({ error: "missing colours" }, { status: 400 });
	}
	const colors = normalizeColors(body.colors);
	const failed = await forward(request, {
		body: JSON.stringify({ colors }),
		method: "PUT",
	});
	return failed ?? Response.json({ colors, ok: true });
}

export async function DELETE(request: Request) {
	const failed = await forward(request, { method: "DELETE" });
	return failed ?? Response.json({ ok: true });
}

/** what's published now, for the vault editor to start from */
export async function GET() {
	return Response.json({ colors: await getSiteColors() });
}
