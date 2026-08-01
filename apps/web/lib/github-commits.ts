const GITHUB_USERNAME =
	process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "ekakshjanweja";

export interface DayCommit {
	message: string;
	repo: string;
	sha: string;
	url: string;
}

interface GitHubCommitSearchItem {
	commit: {
		message: string;
	};
	html_url: string;
	repository: {
		full_name: string;
	};
	sha: string;
}

interface GitHubCommitSearchResponse {
	items: GitHubCommitSearchItem[];
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isValidContributionDate = (date: string) =>
	DATE_PATTERN.test(date);

export const fetchCommitsForDate = async (
	date: string
): Promise<DayCommit[]> => {
	const token = process.env.GITHUB_TOKEN;

	if (!(token && isValidContributionDate(date))) {
		return [];
	}

	const query = `author:${GITHUB_USERNAME} committer-date:${date}..${date}`;
	const endpoint = new URL("https://api.github.com/search/commits");
	endpoint.searchParams.set("q", query);
	endpoint.searchParams.set("per_page", "20");
	endpoint.searchParams.set("sort", "author-date");
	endpoint.searchParams.set("order", "desc");

	const response = await fetch(endpoint, {
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${token}`,
			"X-GitHub-Api-Version": "2022-11-28",
		},
	});

	if (!response.ok) {
		return [];
	}

	const data = (await response.json()) as GitHubCommitSearchResponse;

	return data.items.map((item) => ({
		message: item.commit.message.split("\n")[0]?.trim() ?? "Commit",
		repo: item.repository.full_name,
		sha: item.sha.slice(0, 7),
		url: item.html_url,
	}));
};
