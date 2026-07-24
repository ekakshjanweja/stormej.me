import { troveSource } from "@/lib/source";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getMDXComponents } from "@/components/mdx";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";
import { AgentSetup } from "@/components/trove/agent-setup";
import {
  buildCreativeWorkSchema,
  buildBreadcrumbSchema,
  jsonLd,
} from "@/lib/schema";
import { isTroveSlugEnabled } from "@/lib/trove-config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type TroveData = {
  title: string;
  description?: string;
  subtitle?: string;
  tech?: string[];
  sourceFile?: string;
  github?: string;
  date?: string;
};

export async function generateStaticParams() {
  return troveSource
    .generateParams()
    .map(({ slug }) => ({ slug: slug?.[0] ?? "" }))
    .filter(({ slug }) => isTroveSlugEnabled(slug));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = troveSource.getPage([slug]);
  if (!page || !isTroveSlugEnabled(slug)) notFound();

  const { title, description } = page.data as TroveData;

  const canonical = `/trove/${slug}`;
  const ogImage = `/og/trove/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = troveSource.getPage([slug]);
  if (!page || !isTroveSlugEnabled(slug)) notFound();

  const MDX = page.data.body;
  const data = page.data as TroveData;

  const meta = [data.sourceFile, ...(data.tech ?? [])]
    .filter(Boolean)
    .join(" · ");

  const schemas = [
    buildCreativeWorkSchema({
      kind: "trove",
      slug,
      title: data.title,
      description: data.description,
      about: data.tech,
      startDate: data.date,
      external: data.github ? [data.github] : undefined,
    }),
    buildBreadcrumbSchema([
      { name: "home", url: "/" },
      { name: "trove", url: "/trove" },
      { name: data.title, url: `/trove/${slug}` },
    ]),
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }}
      />
      <ContentViewTracker kind="trove" slug={slug} title={data.title} />
      <Link
        href="/trove"
        className="meta-tag hover-dim inline-flex items-center gap-1.5 mb-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
      >
        ← back
      </Link>

      <header className="mb-10 space-y-4">
        <h1 className="headline text-balance text-[clamp(24px,2.8vw,36px)]">
          {data.title}
        </h1>
        {meta && <p className="meta-tag">{meta}</p>}
        {data.description && (
          <p className="text-pretty text-[14px] font-light leading-[1.6] text-muted-foreground">
            {data.description}
          </p>
        )}
        <AgentSetup
          slug={slug}
          title={data.title}
          sourceFile={data.sourceFile}
        />
      </header>

      <article className="prose-fuma">
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(troveSource, page),
          })}
        />
      </article>
    </main>
  );
}
