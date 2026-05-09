import { projectsSource } from "@/lib/source";
import projectsMeta from "@/content/projects/meta.json";

/** Slug order from `content/projects/meta.json` → `pages` (Fumadocs meta). */
const projectOrderIndex = new Map(
  (projectsMeta.pages ?? []).map((slug, i) => [slug, i])
);

function sortKeyForSlug(slug: string) {
  return projectOrderIndex.get(slug) ?? Number.POSITIVE_INFINITY;
}

export type ProjectFrontmatter = {
  title: string;
  subtitle?: string;
  description?: string;
  tech: string[];
  website?: string;
  github?: string;
  youtube?: string;
  images?: string[];
  inlineGallery?: boolean;
  hidden?: boolean;
  published?: boolean;
};

export type ProjectListItem = {
  slug: string;
  url: string;
  title: string;
  subtitle?: string;
  description?: string;
  website?: string;
  hidden?: boolean;
};

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
        slug,
        url: page.url,
        title: fm.title,
        subtitle: fm.subtitle,
        description: fm.description,
        website: fm.website,
        hidden: fm.hidden,
        _sortTitle: fm.title,
      };
    })
    .sort((a, b) => {
      const oa = sortKeyForSlug(a.slug);
      const ob = sortKeyForSlug(b.slug);
      if (oa !== ob) return oa - ob;
      return a._sortTitle.localeCompare(b._sortTitle, undefined, {
        sensitivity: "base",
      });
    })
    .map(({ _sortTitle: _t, ...rest }) => rest);
}

export function getProject(slug: string) {
  const page = projectsSource.getPage([slug]);
  if (!page) return null;
  return page;
}
