import { source } from "@/lib/source";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getMDXComponents } from "@/components/mdx";
import { createRelativeLink } from "fumadocs-ui/mdx";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return source.generateParams().map(({ slug }) => ({
    slug: slug?.[0] ?? "",
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage([slug]);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = source.getPage([slug]);
  if (!page) notFound();

  const MDX = page.data.body;

  const dateText = page.data.date
    ? new Date(page.data.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main>
      <Link
        href="/blog"
        className="meta-tag hover-dim inline-flex items-center gap-1.5 mb-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
      >
        ← back
      </Link>

      <header className="mb-10 space-y-4">
        <h1 className="headline text-[clamp(24px,2.8vw,36px)]">
          {page.data.title}
        </h1>
        {dateText && <p className="meta-tag">{dateText}</p>}
        {page.data.description && (
          <p className="text-[14px] font-light leading-[1.6] text-muted-foreground">
            {page.data.description}
          </p>
        )}
      </header>

      <article className="prose-fuma">
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </article>
    </main>
  );
}
