import { troveSource } from "@/lib/source";
import { isTroveSlugEnabled, TROVE_ENABLED } from "@/lib/trove-config";

export interface TroveListItem {
	date?: string;
	demo?: string;
	description?: string;
	formattedDate: string;
	github?: string;
	lines?: number;
	slug: string;
	sourceFile?: string;
	subtitle?: string;
	tech: string[];
	title: string;
	url: string;
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

export function listTrove(): TroveListItem[] {
	if (!TROVE_ENABLED) {
		return [];
	}

	const pages = troveSource.getPages().filter((p) => {
		const data = p.data as { published?: boolean; hidden?: boolean };
		if (data.published === false || data.hidden === true) {
			return false;
		}
		return isTroveSlugEnabled(p.slugs[0] ?? "");
	});

	return pages
		.map((page) => {
			const data = page.data as {
				title: string;
				description?: string;
				subtitle?: string;
				tech?: string[];
				sourceFile?: string;
				lines?: number;
				github?: string;
				demo?: string;
				date?: string;
			};
			const slug = page.slugs[0] ?? "";
			return {
				date: data.date,
				demo: data.demo,
				description: data.description,
				formattedDate: fmt(data.date),
				github: data.github,
				lines: data.lines,
				slug,
				sourceFile: data.sourceFile,
				subtitle: data.subtitle,
				tech: data.tech ?? [],
				title: data.title,
				url: page.url,
			};
		})
		.sort((a, b) => {
			const ta = a.date ? new Date(a.date).getTime() : 0;
			const tb = b.date ? new Date(b.date).getTime() : 0;
			return tb - ta;
		});
}
