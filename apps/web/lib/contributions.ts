import { unstable_cache } from "next/cache";

type ContributionsResponse = {
  contributions: {
    date: string;
    count: number;
    level: number;
  }[];
  total: Record<string, number>;
};

const GITHUB_USERNAME =
  process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "ekakshjanweja";

const CONTRIBUTIONS_ENDPOINT = "https://github-contributions-api.jogruber.de";

export const getGithubContributions = unstable_cache(
  async () => {
    const endpoint = new URL(`/v4/${GITHUB_USERNAME}`, CONTRIBUTIONS_ENDPOINT);

    const response = await fetch(endpoint, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub contributions");
    }

    const data = (await response.json()) as ContributionsResponse;
    const currentYear = new Date().getFullYear();

    const contributionsForYear = selectYear(
      data.contributions,
      currentYear.toString()
    );

    if (contributionsForYear.length > 0) {
      return {
        contributions: contributionsForYear,
        total:
          data.total[currentYear] ??
          contributionsForYear.reduce((sum, day) => sum + day.count, 0),
        year: currentYear,
      };
    }

    const latestYear = Object.keys(data.total)
      .map(Number)
      .sort((a, b) => b - a)[0];

    const fallbackYear = latestYear ?? currentYear - 1;
    const fallbackContributions = selectYear(
      data.contributions,
      fallbackYear.toString()
    );

    return {
      contributions: fallbackContributions,
      total:
        data.total[fallbackYear] ??
        fallbackContributions.reduce((sum, day) => sum + day.count, 0),
      year: fallbackYear,
    };
  },
  ["github-contributions", GITHUB_USERNAME],
  {
    revalidate: 60 * 60 * 24,
    tags: ["github-contributions"],
  }
);

const selectYear = (
  contributions: ContributionsResponse["contributions"],
  year: string
) =>
  contributions.filter((activity) =>
    activity.date.startsWith(String(year))
  );

