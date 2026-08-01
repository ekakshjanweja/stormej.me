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
