import {
	fetchHuggingFaceStats,
	type HuggingFaceRepoRef,
} from "@/lib/huggingface";
import { publicationsSource } from "@/lib/source";

export interface PublicationListItem {
	arxivId?: string;
	arxivUrl?: string;
	authors: string[];
	date?: string;
	description?: string;
	doi?: string;
	/** total hugging face downloads, attached by withHuggingFaceDownloads */
	downloads?: number;
	formattedDate: string;
	huggingface?: HuggingFaceRepoRef[];
	/** link target for the downloads chip, attached by withHuggingFaceDownloads */
	huggingfaceUrl?: string;
	paperUrl: string;
	pdfUrl?: string;
	slug: string;
	title: string;
	venue?: string;
	year?: string;
}

const fmt = (d?: string) => {
	if (!d) {
		return "";
	}
	return new Date(d).toLocaleDateString("en-US", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
};

const resolveArxivUrl = (arxivId?: string, arxivUrl?: string) => {
	if (arxivUrl) {
		return arxivUrl;
	}
	if (arxivId) {
		return `https://arxiv.org/abs/${arxivId}`;
	}
};

export const resolvePaperUrl = (data: {
	arxivId?: string;
	arxivUrl?: string;
	pdfUrl?: string;
	doi?: string;
}) =>
	resolveArxivUrl(data.arxivId, data.arxivUrl) ??
	data.pdfUrl ??
	(data.doi ? `https://doi.org/${data.doi}` : undefined);

export function listPublications(): PublicationListItem[] {
	const pages = publicationsSource.getPages().filter((p) => {
		const { published } = p.data as { published?: boolean };
		return published !== false;
	});

	return pages
		.flatMap((page): PublicationListItem[] => {
			const data = page.data as {
				title: string;
				description?: string;
				authors?: string[];
				venue?: string;
				date?: string;
				arxivId?: string;
				arxivUrl?: string;
				pdfUrl?: string;
				doi?: string;
				huggingface?: HuggingFaceRepoRef[];
			};
			const slug = page.slugs[0] ?? "";
			const paperUrl = resolvePaperUrl(data);
			if (!paperUrl) {
				return [];
			}
			const year = data.date
				? new Date(data.date).getFullYear().toString()
				: undefined;
			return [
				{
					arxivId: data.arxivId,
					arxivUrl: resolveArxivUrl(data.arxivId, data.arxivUrl),
					authors: data.authors ?? [],
					date: data.date,
					description: data.description,
					doi: data.doi,
					formattedDate: fmt(data.date),
					huggingface: data.huggingface,
					paperUrl,
					pdfUrl: data.pdfUrl,
					slug,
					title: data.title,
					venue: data.venue,
					year,
				},
			];
		})
		.sort((a, b) => {
			const ta = a.date ? new Date(a.date).getTime() : 0;
			const tb = b.date ? new Date(b.date).getTime() : 0;
			return tb - ta;
		});
}

/**
 * server only: resolves hugging face download counts for the given items. a
 * publication with several repos reports their combined total.
 */
export async function withHuggingFaceDownloads(
	publications: PublicationListItem[]
): Promise<PublicationListItem[]> {
	return await Promise.all(
		publications.map(async (pub) => {
			const stats = await fetchHuggingFaceStats(pub.huggingface);
			const counted = stats.filter((s) => s.downloads !== undefined);
			if (counted.length === 0) {
				return pub;
			}
			return {
				...pub,
				downloads: counted.reduce((sum, s) => sum + (s.downloads ?? 0), 0),
				// several repos share one chip, so it points at the first
				huggingfaceUrl: counted[0]?.url,
			};
		})
	);
}
