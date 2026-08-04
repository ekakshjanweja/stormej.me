export type HuggingFaceRepoType = "dataset" | "model" | "space";

export interface HuggingFaceRepoRef {
	id: string;
	label?: string;
	type?: HuggingFaceRepoType;
}

export interface HuggingFaceRepoStats {
	downloads?: number;
	id: string;
	label?: string;
	likes?: number;
	type: HuggingFaceRepoType;
	url: string;
}

interface HuggingFaceApiResponse {
	downloads?: number;
	downloadsAllTime?: number;
	likes?: number;
}

// hf only returns lifetime downloads when it is asked for explicitly, the
// default payload carries the rolling 30 day number instead.
const EXPAND_PARAMS = ["downloadsAllTime", "downloads", "likes"];

const API_SEGMENT: Record<HuggingFaceRepoType, string> = {
	dataset: "datasets",
	model: "models",
	space: "spaces",
};

const PAGE_SEGMENT: Record<HuggingFaceRepoType, string> = {
	dataset: "datasets/",
	model: "",
	space: "spaces/",
};

const REVALIDATE_SECONDS = 60 * 60 * 6;

const TRAILING_ZERO_DECIMAL = /\.0$/;

export const huggingFaceRepoUrl = (
	id: string,
	type: HuggingFaceRepoType = "dataset"
) => `https://huggingface.co/${PAGE_SEGMENT[type]}${id}`;

export const formatDownloads = (value: number) => {
	if (value >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(1).replace(TRAILING_ZERO_DECIMAL, "")}M`;
	}
	return value.toLocaleString("en-US");
};

// list rows sit next to the venue tag, so the exact count is too wide there.
export const formatDownloadsCompact = (value: number) => {
	if (value >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(1).replace(TRAILING_ZERO_DECIMAL, "")}M`;
	}
	if (value >= 1000) {
		return `${Math.round(value / 1000)}k`;
	}
	return value.toString();
};

const fetchRepoStats = async (
	ref: HuggingFaceRepoRef
): Promise<HuggingFaceRepoStats> => {
	const type = ref.type ?? "dataset";
	const base: HuggingFaceRepoStats = {
		id: ref.id,
		label: ref.label,
		type,
		url: huggingFaceRepoUrl(ref.id, type),
	};

	const endpoint = new URL(
		`https://huggingface.co/api/${API_SEGMENT[type]}/${ref.id}`
	);
	for (const param of EXPAND_PARAMS) {
		endpoint.searchParams.append("expand[]", param);
	}

	const token = process.env.HUGGINGFACE_TOKEN;

	try {
		const response = await fetch(endpoint, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			next: { revalidate: REVALIDATE_SECONDS },
		});

		if (!response.ok) {
			return base;
		}

		const data = (await response.json()) as HuggingFaceApiResponse;

		return {
			...base,
			downloads: data.downloadsAllTime ?? data.downloads,
			likes: data.likes,
		};
	} catch {
		// stats are decoration, a hf outage should never take the page down
		return base;
	}
};

export const fetchHuggingFaceStats = async (
	refs?: HuggingFaceRepoRef[]
): Promise<HuggingFaceRepoStats[]> => {
	if (!refs?.length) {
		return [];
	}
	return await Promise.all(refs.map(fetchRepoStats));
};
