import { workSource } from "@/lib/source";
import type { WorkImageAsset, ScreenshotMockupKind, WorkLogoAsset } from "@/lib/types/types";
import workMeta from "@/content/work/meta.json";

type WorkMetaJson = {
  title?: string;
  pages?: string[];
  /** Optional: exact slugs shown on the home work strip (order preserved). Falls back to first `homeCount` of {@link listWork} when omitted. */
  home?: string[];
  /** How many work rows on home when `home` is omitted (first N after `pages` sort). */
  homeCount?: number;
};

const workMetaTyped = workMeta as WorkMetaJson;

/** Slug order from `content/work/meta.json` → `pages` (Fumadocs meta). */
const workOrderIndex = new Map(
  (workMetaTyped.pages ?? []).map((slug, i) => [slug, i])
);

function workHomeCount(): number {
  const n = workMetaTyped.homeCount;
  return typeof n === "number" && n > 0 ? n : 4;
}

function sortKeyForWorkSlug(slug: string) {
  return workOrderIndex.get(slug) ?? Number.POSITIVE_INFINITY;
}

export type WorkChapterNav = { id: string; label: string };

export type WorkFrontmatter = {
  title: string;
  subtitle?: string;
  description?: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  website?: string;
  appStore?: string;
  playStore?: string;
  tech: string[];
  logo?: WorkLogoAsset;
  images?: WorkImageAsset[];
  screenshotMockup?: ScreenshotMockupKind;
  challenge?: string;
  chapters?: WorkChapterNav[];
  published?: boolean;
};

export type WorkListItem = {
  slug: string;
  url: string;
  title: string;
  description?: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  logo?: WorkLogoAsset;
  images?: WorkImageAsset[];
  screenshotMockup?: ScreenshotMockupKind;
};

export function listWork(): WorkListItem[] {
  const pages = workSource.getPages().filter((p) => {
    const fm = p.data as Partial<WorkFrontmatter>;
    return fm.published !== false;
  });

  return pages
    .map((page) => {
      const fm = page.data as WorkFrontmatter;
      const slug = page.slugs[0] ?? "";
      return {
        slug,
        url: page.url,
        title: fm.title,
        description: fm.description,
        role: fm.role,
        startDate: new Date(fm.startDate),
        endDate: fm.endDate ? new Date(fm.endDate) : undefined,
        logo: fm.logo,
        images: fm.images,
        screenshotMockup: fm.screenshotMockup,
      };
    })
    .sort((a, b) => {
      const oa = sortKeyForWorkSlug(a.slug);
      const ob = sortKeyForWorkSlug(b.slug);
      if (oa !== ob) return oa - ob;
      return b.startDate.getTime() - a.startDate.getTime();
    });
}

/** Home work strip: `meta.home` slugs in order when set; else first `homeCount` entries of {@link listWork}. */
export function listWorkForHome(): WorkListItem[] {
  const all = listWork();
  const bySlug = new Map(all.map((w) => [w.slug, w]));
  const homeSlugs = workMetaTyped.home?.filter(Boolean);
  if (homeSlugs && homeSlugs.length > 0) {
    return homeSlugs
      .map((slug) => bySlug.get(slug))
      .filter((w): w is WorkListItem => w != null);
  }
  return all.slice(0, workHomeCount());
}

export function getWork(slug: string) {
  const page = workSource.getPage([slug]);
  if (!page) return null;
  return page;
}

export type WorkExperienceInterval = Pick<WorkListItem, "startDate" | "endDate">;

/** Sum of merged employment intervals in milliseconds (overlapping roles count once). */
export function totalWorkExperienceMergedMs(
  items: WorkExperienceInterval[],
  now: Date = new Date()
): number {
  if (items.length === 0) return 0;
  const intervals = items
    .map((item) => ({
      start: item.startDate.getTime(),
      end: (item.endDate ?? now).getTime(),
    }))
    .filter((i) => i.end >= i.start)
    .sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];
  for (const iv of intervals) {
    const last = merged[merged.length - 1];
    if (!last) {
      merged.push({ start: iv.start, end: iv.end });
      continue;
    }
    if (iv.start <= last.end) {
      last.end = Math.max(last.end, iv.end);
    } else {
      merged.push({ start: iv.start, end: iv.end });
    }
  }
  return merged.reduce((sum, m) => sum + (m.end - m.start), 0);
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
const MS_PER_MONTH = (365.25 / 12) * 24 * 60 * 60 * 1000;

/** Short caption e.g. "~6 yrs" or "~8 mo". Uses {@link listWork} when `items` omitted. */
export function formatTotalExperienceShort(
  items?: WorkExperienceInterval[],
  now: Date = new Date()
): string {
  const list = items ?? listWork();
  const ms = totalWorkExperienceMergedMs(list, now);
  if (ms <= 0) return "";
  const years = ms / MS_PER_YEAR;
  if (years < 1) {
    const months = Math.max(1, Math.round(ms / MS_PER_MONTH));
    return `~${months} mo`;
  }
  return `~${Math.round(years)} yrs`;
}

export function formatTotalExperienceAriaLabel(
  items?: WorkExperienceInterval[],
  now: Date = new Date()
): string {
  const list = items ?? listWork();
  const ms = totalWorkExperienceMergedMs(list, now);
  if (ms <= 0) return "";
  const years = ms / MS_PER_YEAR;
  if (years < 1) {
    const months = Math.max(1, Math.round(ms / MS_PER_MONTH));
    return `About ${months} months of professional experience across listed roles.`;
  }
  const y = Math.round(years);
  return `About ${y} years of professional experience across listed roles (overlapping periods counted once).`;
}
