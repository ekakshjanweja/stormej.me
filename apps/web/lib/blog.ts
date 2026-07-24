import { source } from "@/lib/source";

export type BlogListItem = {
	slug: string;
	url: string;
	title: string;
	description?: string;
	date?: string;
	formattedDate: string;
};

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

export function listBlogs(): BlogListItem[] {
	const pages = source.getPages().filter((p) => {
		const published = (p.data as { published?: boolean }).published;
		return published !== false;
	});

	return pages
		.map((page) => {
			const data = page.data as {
				title: string;
				description?: string;
				date?: string;
			};
			const slug = page.slugs[0] ?? "";
			return {
				date: data.date,
				description: data.description,
				formattedDate: fmt(data.date),
				slug,
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
