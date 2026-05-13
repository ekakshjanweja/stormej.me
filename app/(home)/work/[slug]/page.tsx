import { workSource } from "@/lib/source";
import { getWork, type WorkFrontmatter } from "@/lib/work";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  WorkCaseStudyHeader,
  WorkDefaultHeader,
} from "@/components/work/header";
import type { Metadata } from "next";
import { Chapter } from "@/components/mdx/chapter";
import { Screens } from "@/components/mdx/screens";
import { Figure } from "@/components/mdx/figure";
import { Gallery } from "@/components/mdx/gallery";
import { getMDXComponents } from "@/components/mdx";
import {
  buildBreadcrumbSchema,
  buildCreativeWorkSchema,
  jsonLd,
} from "@/lib/schema";

function formatRange(start: Date, end?: Date | null) {
  const fmt = (d: Date) =>
    d
      .toLocaleString("default", { month: "short", year: "numeric" })
      .toLowerCase();
  return `${fmt(start)} to ${end ? fmt(end) : "present"}`;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return workSource.generateParams().map(({ slug }) => ({
    slug: slug?.[0] ?? "",
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getWork(slug);
  if (!page) notFound();
  const fm = page.data as WorkFrontmatter;

  const canonical = `/work/${slug}`;
  const ogImage = `/og/work/${slug}`;

  return {
    title: fm.title,
    description: fm.description,
    alternates: { canonical },
    openGraph: {
      title: fm.title,
      description: fm.description,
      url: canonical,
      type: "article",
      images: [
        { url: ogImage, width: 1200, height: 630, alt: fm.title },
      ],
    },
    twitter: {
      title: fm.title,
      description: fm.description,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = getWork(slug);
  if (!page) notFound();

  const fm = page.data as WorkFrontmatter;
  const startDate = new Date(fm.startDate);
  const endDate = fm.endDate ? new Date(fm.endDate) : undefined;
  const hasCaseStudy = !!(fm.chapters && fm.chapters.length > 0);
  const MDX = page.data.body;

  const chapters = fm.chapters ?? [];
  const firstChapterId = chapters[0]?.id;

  const chapterIndexById = new Map<string, number>();
  chapters.forEach((c, i) => chapterIndexById.set(c.id, i));

  const ChapterWithIndex = (props: {
    id: string;
    label: string;
    title: string;
    pullQuote?: string;
    children: React.ReactNode;
  }) => {
    const idx = chapterIndexById.get(props.id) ?? 0;
    return <Chapter {...props} index={idx} />;
  };

  const ScreensWithTitle = (props: React.ComponentProps<typeof Screens>) => (
    <Screens
      {...props}
      title={props.title ?? fm.title}
      mockup={props.mockup ?? fm.screenshotMockup}
    />
  );

  const components = getMDXComponents({
    Chapter: ChapterWithIndex,
    Screens: ScreensWithTitle,
    Figure,
    Gallery,
  });

  const schemas = [
    buildCreativeWorkSchema({
      kind: "work",
      slug,
      title: fm.title,
      description: fm.description,
      about: fm.tech,
      startDate,
      endDate,
      website: fm.website,
      external: [fm.appStore, fm.playStore].filter(
        (s): s is string => Boolean(s)
      ),
    }),
    buildBreadcrumbSchema([
      { name: "home", url: "/" },
      { name: "work", url: "/work" },
      { name: fm.title, url: `/work/${slug}` },
    ]),
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }}
      />
      <Link
        href="/work"
        className="meta-tag hover-dim inline-flex items-center gap-1.5 mb-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
      >
        ← back
      </Link>

      <article className="relative">
        {hasCaseStudy && firstChapterId && (
          <a
            href={`#${firstChapterId}`}
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-24 focus:z-[200] focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:text-[13px] focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          >
            skip to case study
          </a>
        )}

        {hasCaseStudy ? (
          <WorkCaseStudyHeader
            fm={fm}
            startDate={startDate}
            endDate={endDate}
            formatRange={formatRange}
          />
        ) : (
          <WorkDefaultHeader
            fm={fm}
            startDate={startDate}
            endDate={endDate}
            formatRange={formatRange}
          />
        )}

        <div className={hasCaseStudy ? "space-y-16" : undefined}>
          <MDX components={components} />
        </div>
      </article>
    </main>
  );
}
