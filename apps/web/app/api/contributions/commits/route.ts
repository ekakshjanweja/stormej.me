import { unstable_cache } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import {
	fetchCommitsForDate,
	isValidContributionDate,
} from "@/lib/github-commits";

const getCachedCommitsForDate = (date: string) =>
	unstable_cache(
		async () => fetchCommitsForDate(date),
		["github-commits", date],
		{ revalidate: 60 * 60 * 6 }
	)();

export async function GET(request: NextRequest) {
	const date = request.nextUrl.searchParams.get("date");

	if (!(date && isValidContributionDate(date))) {
		return NextResponse.json({ error: "Invalid date" }, { status: 400 });
	}

	const commits = await getCachedCommitsForDate(date);

	return NextResponse.json(
		{ commits },
		{
			headers: {
				"Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
			},
		}
	);
}
