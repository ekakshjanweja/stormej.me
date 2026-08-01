import {
	differenceInCalendarDays,
	formatISO,
	parseISO,
	startOfDay,
	subDays,
} from "date-fns";
import { unstable_cache } from "next/cache";

export interface ContributionActivity {
	count: number;
	date: string;
	level: number;
}

interface ContributionsResponse {
	contributions: ContributionActivity[];
	total: Record<string, number>;
}

const GITHUB_USERNAME =
	process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "ekakshjanweja";

const CONTRIBUTIONS_ENDPOINT = "https://github-contributions-api.jogruber.de";

export interface GithubContributionsData {
	contributions: ContributionActivity[];
	defaultYear: number;
	totalsByYear: Record<number, number>;
	years: number[];
}

export const getGithubContributions = unstable_cache(
	async (): Promise<GithubContributionsData> => {
		const endpoint = new URL(`/v4/${GITHUB_USERNAME}`, CONTRIBUTIONS_ENDPOINT);

		const response = await fetch(endpoint, {
			next: { revalidate: 60 * 60 * 24 },
		});

		if (!response.ok) {
			throw new Error("Failed to fetch GitHub contributions");
		}

		const data = (await response.json()) as ContributionsResponse;
		const years = Object.keys(data.total)
			.map(Number)
			.sort((a, b) => b - a);
		const currentYear = new Date().getFullYear();
		const defaultYear = years.includes(currentYear)
			? currentYear
			: (years[0] ?? currentYear);

		const totalsByYear = Object.fromEntries(
			Object.entries(data.total).map(([year, total]) => [Number(year), total])
		) as Record<number, number>;

		return {
			contributions: data.contributions,
			defaultYear,
			totalsByYear,
			years,
		};
	},
	["github-contributions", GITHUB_USERNAME],
	{
		revalidate: 60 * 60 * 24,
		tags: ["github-contributions"],
	}
);

export const selectYearContributions = (
	contributions: ContributionActivity[],
	year: number
) => contributions.filter((activity) => activity.date.startsWith(String(year)));

export interface ContributionStreaks {
	current: number;
	longest: number;
}

export const computeContributionStreaks = (
	contributions: ContributionActivity[]
): ContributionStreaks => {
	const activeDays = contributions
		.filter((day) => day.count > 0)
		.map((day) => day.date)
		.sort((a, b) => a.localeCompare(b));

	if (activeDays.length === 0) {
		return { current: 0, longest: 0 };
	}

	let longest = 1;
	let run = 1;

	for (let index = 1; index < activeDays.length; index += 1) {
		const previous = parseISO(activeDays[index - 1] as string);
		const current = parseISO(activeDays[index] as string);

		if (differenceInCalendarDays(current, previous) === 1) {
			run += 1;
			longest = Math.max(longest, run);
		} else {
			run = 1;
		}
	}

	const activeDaySet = new Set(activeDays);
	const today = startOfDay(new Date());
	const todayKey = formatISO(today, { representation: "date" });
	let cursor = activeDaySet.has(todayKey) ? today : subDays(today, 1);
	let current = 0;

	while (activeDaySet.has(formatISO(cursor, { representation: "date" }))) {
		current += 1;
		cursor = subDays(cursor, 1);
	}

	return { current, longest };
};
