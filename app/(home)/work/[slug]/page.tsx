import { workSource } from "@/lib/source";
import { getWork, type WorkFrontmatter } from "@/lib/work";
import { notFound } from "next/navigation";
import Link from "next/link";
import { WorkLogoMark } from "@/components/work-logo";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { Chapter } from "@/components/mdx/chapter";
import { Screens } from "@/components/mdx/screens";
import { Figure } from "@/components/mdx/figure";
import { Gallery } from "@/components/mdx/gallery";
import { getMDXComponents } from "@/components/mdx";

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
  return {
    title: fm.title,
    description: fm.description,
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

  return (
    <main>
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
          <CaseStudyHeader fm={fm} startDate={startDate} endDate={endDate} />
        ) : (
          <DefaultHeader fm={fm} startDate={startDate} endDate={endDate} />
        )}

        {hasCaseStudy && (
          <nav
            aria-label="case study sections"
            className="sticky top-16 z-30 -mx-1 mb-10 overflow-x-auto bg-background/85 px-1 py-2 backdrop-blur-md custom-scrollbar"
          >
            <ul className="flex items-center gap-x-5 whitespace-nowrap">
              {chapters.map((ch) => (
                <li key={ch.id}>
                  <a
                    href={`#${ch.id}`}
                    className="meta-tag hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
                  >
                    {ch.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className={hasCaseStudy ? "space-y-16" : undefined}>
          <MDX components={components} />
        </div>
      </article>
    </main>
  );
}

function CaseStudyHeader({
  fm,
  startDate,
  endDate,
}: {
  fm: WorkFrontmatter;
  startDate: Date;
  endDate?: Date;
}) {
  return (
    <header className="mb-10 space-y-5">
      <div className="flex items-center gap-3">
        {fm.logo && <WorkLogoMark logo={fm.logo} />}
        {fm.website ? (
          <a
            href={fm.website}
            target="_blank"
            rel="noopener noreferrer"
            className="headline text-[clamp(22px,2.4vw,30px)] hover-dim inline-flex items-center gap-2"
          >
            {fm.title}
            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
          </a>
        ) : (
          <h1 className="headline text-[clamp(22px,2.4vw,30px)]">{fm.title}</h1>
        )}
      </div>

      {fm.challenge && (
        <p className="text-[15px] font-light leading-[1.6] text-foreground max-w-[60ch]">
          {fm.challenge}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y border-border/70 py-4 sm:grid-cols-3">
        <MetaCell label="role" value={fm.role} />
        <MetaCell label="timeline" value={formatRange(startDate, endDate)} />
        <MetaCell label="stack" value={fm.tech.join(" · ")} />
      </dl>
    </header>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="meta-tag">{label}</dt>
      <dd className="text-[13px] font-light text-foreground">{value}</dd>
    </div>
  );
}

function DefaultHeader({
  fm,
  startDate,
  endDate,
}: {
  fm: WorkFrontmatter;
  startDate: Date;
  endDate?: Date;
}) {
  return (
    <header className="mb-10 space-y-4">
      <div className="flex items-center gap-3">
        {fm.logo && <WorkLogoMark logo={fm.logo} />}
        {fm.website ? (
          <a
            href={fm.website}
            target="_blank"
            rel="noopener noreferrer"
            className="headline text-[clamp(22px,2.4vw,30px)] hover-dim inline-flex items-center gap-2"
          >
            {fm.title}
            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
          </a>
        ) : (
          <h1 className="headline text-[clamp(22px,2.4vw,30px)]">{fm.title}</h1>
        )}
      </div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[14px] font-light text-foreground">
          {fm.role}
        </span>
        <span className="meta-tag">{formatRange(startDate, endDate)}</span>
      </div>

      {fm.description && (
        <p className="text-[14px] font-light leading-[1.6] text-muted-foreground">
          {fm.description}
        </p>
      )}

      {fm.tech && fm.tech.length > 0 && (
        <p className="meta-tag">{fm.tech.join(" · ")}</p>
      )}
    </header>
  );
}
