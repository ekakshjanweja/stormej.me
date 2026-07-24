import { publicationsSource } from "@/lib/source";

export interface PublicationListItem {
	arxivId?: string;
	arxivUrl?: string;
	authors: string[];
	date?: string;
	description?: string;
	doi?: string;
	formattedDate: string;
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
		const published = (p.data as { published?: boolean }).published;
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
