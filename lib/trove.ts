import { troveSource } from "@/lib/source";

export type TroveListItem = {
  slug: string;
  url: string;
  title: string;
  description?: string;
  subtitle?: string;
  tech: string[];
  sourceFile?: string;
  lines?: number;
  github?: string;
  demo?: string;
  date?: string;
  formattedDate: string;
};

const fmt = (d?: string) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function listTrove(): TroveListItem[] {
  const pages = troveSource.getPages().filter((p) => {
    const data = p.data as { published?: boolean; hidden?: boolean };
    return data.published !== false && data.hidden !== true;
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
        slug,
        url: page.url,
        title: data.title,
        description: data.description,
        subtitle: data.subtitle,
        tech: data.tech ?? [],
        sourceFile: data.sourceFile,
        lines: data.lines,
        github: data.github,
        demo: data.demo,
        date: data.date,
        formattedDate: fmt(data.date),
      };
    })
    .sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0;
      const tb = b.date ? new Date(b.date).getTime() : 0;
      return tb - ta;
    });
}
