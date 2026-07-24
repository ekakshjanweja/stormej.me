import projectsMeta from "@/content/projects/meta.json";
import { projectsSource } from "@/lib/source";

/** Slug order from `content/projects/meta.json` → `pages` (Fumadocs meta). */
const projectOrderIndex = new Map(
	(projectsMeta.pages ?? []).map((slug, i) => [slug, i])
);

function sortKeyForSlug(slug: string) {
	return projectOrderIndex.get(slug) ?? Number.POSITIVE_INFINITY;
}

export interface ProjectFrontmatter {
	description?: string;
	github?: string;
	hidden?: boolean;
	images?: string[];
	inlineGallery?: boolean;
	published?: boolean;
	subtitle?: string;
	tech: string[];
	title: string;
	website?: string;
	youtube?: string;
}

export interface ProjectListItem {
	description?: string;
	hidden?: boolean;
	slug: string;
	subtitle?: string;
	title: string;
	url: string;
	website?: string;
}

export function listProjects(): ProjectListItem[] {
	const pages = projectsSource.getPages().filter((p) => {
		const fm = p.data as Partial<ProjectFrontmatter>;
		return fm.published !== false;
	});

	return pages
		.map((page) => {
			const fm = page.data as ProjectFrontmatter;
			const slug = page.slugs[0] ?? "";
			return {
				_sortTitle: fm.title,
				description: fm.description,
				hidden: fm.hidden,
				slug,
				subtitle: fm.subtitle,
				title: fm.title,
				url: page.url,
				website: fm.website,
			};
		})
		.sort((a, b) => {
			const oa = sortKeyForSlug(a.slug);
			const ob = sortKeyForSlug(b.slug);
			if (oa !== ob) {
				return oa - ob;
			}
			return a._sortTitle.localeCompare(b._sortTitle, undefined, {
				sensitivity: "base",
			});
		})
		.map(({ _sortTitle: _t, ...rest }) => rest);
}

export function getProject(slug: string) {
	const page = projectsSource.getPage([slug]);
	if (!page) {
		return null;
	}
	return page;
}
