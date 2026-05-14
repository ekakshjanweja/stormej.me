import { projectsSource } from "@/lib/source";
import { getProject, type ProjectFrontmatter } from "@/lib/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { YouTubeVideo } from "@/components/video-component";
import { LinkPreview } from "@/components/ui/link-preview";
import { ProjectImages } from "./project-images";
import { getMDXComponents } from "@/components/mdx";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";
import {
  buildBreadcrumbSchema,
  buildCreativeWorkSchema,
  jsonLd,
} from "@/lib/schema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projectsSource.generateParams().map(({ slug }) => ({
    slug: slug?.[0] ?? "",
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getProject(slug);
  if (!page) notFound();
  const fm = page.data as ProjectFrontmatter;

  const description = fm.description ?? fm.subtitle;
  const canonical = `/projects/${slug}`;
  const ogImage = `/og/projects/${slug}`;

  return {
    title: fm.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: fm.title,
      description,
      url: canonical,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: fm.title }],
    },
    twitter: {
      title: fm.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = getProject(slug);
  if (!page) notFound();

  const fm = page.data as ProjectFrontmatter;
  const MDX = page.data.body;

  const schemas = [
    buildCreativeWorkSchema({
      kind: "projects",
      slug,
      title: fm.title,
      description: fm.description ?? fm.subtitle,
      about: fm.tech,
      website: fm.website,
      external: [fm.github, fm.youtube].filter((s): s is string => Boolean(s)),
    }),
    buildBreadcrumbSchema([
      { name: "home", url: "/" },
      { name: "projects", url: "/projects" },
      { name: fm.title, url: `/projects/${slug}` },
    ]),
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }}
      />
      <ContentViewTracker kind="project" slug={slug} title={fm.title} />
      <Link
        href="/projects"
        className="meta-tag hover-dim inline-flex items-center gap-1.5 mb-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
      >
        ← back
      </Link>

      <header className="mb-10 space-y-4">
        {fm.website ? (
          <h1 className="headline m-0 text-[clamp(22px,2.4vw,30px)]">
            <LinkPreview
              url={fm.website}
              className="font-serif italic inline-flex min-w-0 items-center gap-2"
            >
              <span className="squiggle-link min-w-0 [overflow-wrap:anywhere]">
                {fm.title}
              </span>
              <ArrowUpRight className="w-4 h-4 shrink-0 text-muted-foreground" />
            </LinkPreview>
          </h1>
        ) : (
          <h1 className="headline text-[clamp(22px,2.4vw,30px)]">{fm.title}</h1>
        )}

        {fm.subtitle && (
          <p className="text-[14px] font-light text-muted-foreground">
            {fm.subtitle}
          </p>
        )}

        {fm.description && (
          <p className="text-[14px] font-light leading-[1.6] text-muted-foreground">
            {fm.description}
          </p>
        )}

        {fm.tech && fm.tech.length > 0 && (
          <p className="meta-tag">{fm.tech.join(" · ")}</p>
        )}

        {(fm.website || fm.github || fm.youtube) && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            {fm.website && (
              <a
                href={fm.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-dim inline-flex items-center gap-1 text-foreground"
              >
                website <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
            {fm.github && (
              <a
                href={fm.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-dim inline-flex items-center gap-1 text-foreground"
              >
                github <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
            {fm.youtube && (
              <a
                href={fm.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-dim inline-flex items-center gap-1 text-foreground"
              >
                youtube <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </header>

      {fm.youtube && (
        <div className="mb-10 rounded-lg overflow-hidden">
          <YouTubeVideo
            videoId={extractYouTubeVideoId(fm.youtube)!}
            title={fm.title}
          />
        </div>
      )}

      {!fm.inlineGallery && (
        <ProjectImages title={fm.title} images={fm.images} />
      )}

      <article className="prose-fuma mt-10">
        <MDX components={getMDXComponents()} />
      </article>
    </main>
  );
}

function extractYouTubeVideoId(url: string): string | null {
  const youtubeUrlRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeUrlRegex);
  return match ? match[1] : "dQw4w9WgXcQ";
}
