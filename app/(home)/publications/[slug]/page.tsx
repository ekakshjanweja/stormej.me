import { publicationsSource } from "@/lib/source";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getMDXComponents } from "@/components/mdx";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type PublicationData = {
  title: string;
  description?: string;
  authors?: string[];
  venue?: string;
  date?: string;
  arxivId?: string;
  arxivUrl?: string;
  pdfUrl?: string;
  doi?: string;
};

const resolveArxivUrl = (arxivId?: string, arxivUrl?: string) => {
  if (arxivUrl) return arxivUrl;
  if (arxivId) return `https://arxiv.org/abs/${arxivId}`;
  return undefined;
};

export async function generateStaticParams() {
  return publicationsSource.generateParams().map(({ slug }) => ({
    slug: slug?.[0] ?? "",
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = publicationsSource.getPage([slug]);
  if (!page) notFound();

  const { title, description, date } = page.data as PublicationData;

  const canonical = `/publications/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: date,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = publicationsSource.getPage([slug]);
  if (!page) notFound();

  const data = page.data as PublicationData;
  const MDX = page.data.body;

  const dateText = data.date
    ? new Date(data.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const arxivUrl = resolveArxivUrl(data.arxivId, data.arxivUrl);
  const authors = data.authors ?? [];

  return (
    <main>
      <ContentViewTracker
        kind="publication"
        slug={slug}
        title={data.title}
      />
      <Link
        href="/publications"
        className="meta-tag hover-dim inline-flex items-center gap-1.5 mb-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
      >
        ← back
      </Link>

      <header className="mb-10 space-y-4">
        <h1 className="headline text-[clamp(24px,2.8vw,36px)]">
          {data.title}
        </h1>
        {authors.length > 0 && (
          <p className="text-[13px] font-light leading-snug text-muted-foreground">
            {authors.join(", ")}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {data.venue && <span className="meta-tag">{data.venue}</span>}
          {dateText && <span className="meta-tag">{dateText}</span>}
          {arxivUrl && (
            <a
              href={arxivUrl}
              target="_blank"
              rel="noreferrer"
              className="meta-tag hover-dim underline-offset-4 hover:underline"
            >
              arxiv{data.arxivId ? `:${data.arxivId}` : ""}
            </a>
          )}
          {data.pdfUrl && (
            <a
              href={data.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="meta-tag hover-dim underline-offset-4 hover:underline"
            >
              pdf
            </a>
          )}
          {data.doi && (
            <a
              href={`https://doi.org/${data.doi}`}
              target="_blank"
              rel="noreferrer"
              className="meta-tag hover-dim underline-offset-4 hover:underline"
            >
              doi
            </a>
          )}
        </div>
        {data.description && (
          <p className="text-[14px] font-light leading-[1.6] text-muted-foreground">
            {data.description}
          </p>
        )}
      </header>

      <article className="prose-fuma">
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(publicationsSource, page),
          })}
        />
      </article>
    </main>
  );
}
