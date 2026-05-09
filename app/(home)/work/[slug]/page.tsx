import { workSource } from "@/lib/source";
import { getWork, type WorkFrontmatter } from "@/lib/work";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { CaseStudyScreens } from "@/components/case-study-screens";
import { Chapter } from "@/components/mdx/chapter";
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

  return (
    <main>
      <Link
        href="/work"
        className="meta-tag hover-dim inline-flex items-center gap-1.5 mb-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
      >
        ← back
      </Link>

      {hasCaseStudy ? (
        <CaseStudyLayout
          fm={fm}
          startDate={startDate}
          endDate={endDate}
          MDX={page.data.body}
        />
      ) : (
        <DefaultLayout fm={fm} startDate={startDate} endDate={endDate} />
      )}
    </main>
  );
}

function CaseStudyLayout({
  fm,
  startDate,
  endDate,
  MDX,
}: {
  fm: WorkFrontmatter;
  startDate: Date;
  endDate?: Date;
  MDX: React.ComponentType<{ components?: Parameters<typeof getMDXComponents>[0] }>;
}) {
  const chapters = fm.chapters ?? [];
  const firstChapterId = chapters[0]?.id;
  const hasScreenshots = !!(fm.images && fm.images.length > 0);

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

  const components = getMDXComponents({
    Chapter: ChapterWithIndex,
  });

  return (
    <article className="relative">
      {firstChapterId && (
        <a
          href={`#${firstChapterId}`}
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-24 focus:z-[200] focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:text-[13px] focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        >
          skip to case study
        </a>
      )}
      <header className="mb-10 space-y-5">
        <div className="flex items-center gap-3">
          {fm.logo && (
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted/40">
              <Image
                src={fm.logo}
                alt=""
                fill
                className="object-contain p-1.5"
              />
            </span>
          )}
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
            <h1 className="headline text-[clamp(22px,2.4vw,30px)]">
              {fm.title}
            </h1>
          )}
        </div>

        {fm.challenge && (
          <p className="text-[15px] font-light leading-[1.6] text-foreground max-w-[60ch]">
            {fm.challenge}
          </p>
        )}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y border-border/70 py-4 sm:grid-cols-4">
          <MetaCell label="role" value={fm.role} />
          <MetaCell
            label="timeline"
            value={formatRange(startDate, endDate)}
          />
          <MetaCell label="stack" value={fm.tech.join(" · ")} />
          {fm.projects && fm.projects.length > 0 && (
            <MetaCell
              label="scope"
              value={`${fm.projects.length} project${
                fm.projects.length > 1 ? "s" : ""
              }`}
            />
          )}
        </dl>

        {fm.projects && fm.projects.length > 0 && (
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            {fm.projects.flatMap((project, pi) => {
              const links = [];
              if (project.website)
                links.push(
                  <a
                    key={`${pi}-w`}
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover-dim inline-flex items-center gap-1 text-foreground"
                  >
                    {fm.projects!.length > 1 ? `${project.title} · web` : "web"}
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                );
              if (project.playstore)
                links.push(
                  <a
                    key={`${pi}-p`}
                    href={project.playstore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover-dim inline-flex items-center gap-1 text-foreground"
                  >
                    {fm.projects!.length > 1
                      ? `${project.title} · play store`
                      : "play store"}
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                );
              if (project.appstore)
                links.push(
                  <a
                    key={`${pi}-a`}
                    href={project.appstore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover-dim inline-flex items-center gap-1 text-foreground"
                  >
                    {fm.projects!.length > 1
                      ? `${project.title} · app store`
                      : "app store"}
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                );
              return links.map((node, i) => <li key={`${pi}-${i}`}>{node}</li>);
            })}
          </ul>
        )}
      </header>

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
          {hasScreenshots && (
            <li>
              <a
                href="#screenshots"
                className="meta-tag hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
              >
                gallery
              </a>
            </li>
          )}
          {fm.outcomes && fm.outcomes.length > 0 && (
            <li>
              <a
                href="#outcomes"
                className="meta-tag hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
              >
                outcomes
              </a>
            </li>
          )}
        </ul>
      </nav>

      <div className="space-y-16">
        <MDX components={components} />
      </div>

      {hasScreenshots && (
        <CaseStudyScreens
          images={fm.images!}
          title={fm.title}
          screenshotMockup={fm.screenshotMockup}
          appendix
        />
      )}

      {fm.outcomes && fm.outcomes.length > 0 && (
        <section id="outcomes" className="scroll-mt-32 mt-16 border-t border-border/70 pt-10">
          <span className="meta-tag mb-6 block">outcomes</span>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-3">
            {fm.outcomes.map((o, i) => (
              <div key={i} className="space-y-2">
                <dd className="headline text-[clamp(20px,1.8vw,24px)] leading-[1.15]">
                  {o.metric}
                </dd>
                <dt className="meta-tag">{o.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}
    </article>
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

function DefaultLayout({
  fm,
  startDate,
  endDate,
}: {
  fm: WorkFrontmatter;
  startDate: Date;
  endDate?: Date;
}) {
  return (
    <>
      <header className="mb-10 space-y-4">
        <div className="flex items-center gap-3">
          {fm.logo && (
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted/40">
              <Image
                src={fm.logo}
                alt=""
                fill
                className="object-contain p-1.5"
              />
            </span>
          )}
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
            <h1 className="headline text-[clamp(22px,2.4vw,30px)]">
              {fm.title}
            </h1>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[14px] font-light text-foreground">
            {fm.role}
          </span>
          <span className="meta-tag">
            {formatRange(startDate, endDate)}
          </span>
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

      {fm.highlights && fm.highlights.length > 0 && (
        <section className="mb-10">
          <h2 className="section-label mb-5">highlights</h2>
          <ul className="space-y-3">
            {fm.highlights.map((highlight, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[14px] font-light leading-[1.6] text-foreground"
              >
                <span className="select-none text-muted-foreground mt-[2px] text-[12px]">
                  •
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {fm.projects && fm.projects.length > 0 && (
        <section>
          <h2 className="section-label mb-6">projects</h2>
          <div className="space-y-8">
            {fm.projects.map((project, i) => (
              <div key={i} className="space-y-3">
                <h3 className="headline text-[18px]">{project.title}</h3>
                {(project.website || project.playstore || project.appstore) && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
                    {project.website && (
                      <a
                        href={project.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-dim inline-flex items-center gap-1 text-foreground"
                      >
                        web <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                    {project.playstore && (
                      <a
                        href={project.playstore}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-dim inline-flex items-center gap-1 text-foreground"
                      >
                        play store <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                    {project.appstore && (
                      <a
                        href={project.appstore}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-dim inline-flex items-center gap-1 text-foreground"
                      >
                        app store <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
                {project.highlights && project.highlights.length > 0 && (
                  <ul className="space-y-2.5">
                    {project.highlights.map((h, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-[14px] font-light leading-[1.6] text-foreground"
                      >
                        <span className="select-none text-muted-foreground mt-[2px] text-[12px]">
                          •
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
