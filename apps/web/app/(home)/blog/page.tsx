import type { Metadata } from "next";
import Link from "next/link";
import { listBlogs } from "@/lib/blog";

const description =
  "writing on mobile development, side projects, and life";

export const metadata: Metadata = {
  title: "blog",
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "blog | stormej",
    description,
    url: "https://www.stormej.me/blog",
    type: "website",
    images: [
      {
        url: "/og/blog",
        width: 1200,
        height: 630,
        alt: "stormej — blog",
      },
    ],
  },
  twitter: {
    title: "blog | stormej",
    description,
    images: ["/og/blog"],
  },
};

export default function Blog() {
  const blogs = listBlogs();

  return (
    <main>
      <div className="sticky top-16 z-20 -mx-2 mb-8 bg-background/85 px-2 py-3 backdrop-blur-md">
        <h1 className="section-label">writing</h1>
      </div>
      <ul className="flex flex-col gap-5">
        {blogs.map((blog) => (
          <li key={blog.slug}>
            <Link
              href={blog.url}
              className="group flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="squiggle-link-hover text-[14px] font-medium text-foreground sm:truncate">
                  {blog.title}
                </span>
                {blog.description && (
                  <span className="text-[12px] font-light text-muted-foreground leading-snug sm:line-clamp-1">
                    {blog.description}
                  </span>
                )}
              </div>
              <span className="meta-tag whitespace-nowrap shrink-0">
                {blog.formattedDate}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
