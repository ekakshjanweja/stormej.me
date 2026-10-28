import { parseActivity } from "@/lib/github-activity";

const ENDPOINT =
	"https://github-contributions-api.jogruber.de/v4/ekakshjanweja";
const CACHE_SECONDS = 3600;

export async function GET() {
	try {
		const response = await fetch(ENDPOINT, {
			next: { revalidate: CACHE_SECONDS },
			signal: AbortSignal.timeout(8000),
		});
		if (!response.ok) {
			throw new Error("GitHub contribution history is unavailable");
		}
		const years = parseActivity(await response.json());
		return Response.json(
			{ years },
			{
				headers: {
					"Cache-Control": `public, max-age=300, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
				},
			}
		);
	} catch {
		return Response.json(
			{ error: "Activity couldn't load. Try again in a moment." },
			{ headers: { "Cache-Control": "no-store" }, status: 503 }
		);
	}
}
