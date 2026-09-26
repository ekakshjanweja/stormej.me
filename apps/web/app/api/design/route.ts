import { revalidateTag } from "next/cache";
import { normalizeDesign } from "@/lib/design/options";
import { DESIGN_CACHE_TAG, workerOrigin } from "@/lib/design/server";

/**
 * Publish a design from the vault. The worker does the auth (it checks the
 * vault cookie we forward) and stores it; on success the cached design is
 * dropped so the next request renders the new one.
 */
export async function PUT(request: Request) {
	const body = (await request.json().catch(() => null)) as {
		design?: unknown;
	} | null;
	if (!body?.design) {
		return Response.json({ error: "missing design" }, { status: 400 });
	}

	const design = normalizeDesign(body.design);
	const response = await fetch(`${workerOrigin()}/admin/design`, {
		body: JSON.stringify({ design }),
		cache: "no-store",
		headers: {
			"Content-Type": "application/json",
			cookie: request.headers.get("cookie") ?? "",
		},
		method: "PUT",
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

	// stale-while-revalidate would show the old design once more; publish should be instant
	revalidateTag(DESIGN_CACHE_TAG, { expire: 0 });
	return Response.json({ design, ok: true });
}
