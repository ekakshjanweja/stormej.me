"use client";

import Link from "next/link";
import { listBlogs } from "@/lib/blog";
import { track } from "@/lib/analytics";

export const BlogRow = () => {
  const blogs = listBlogs();

  return (
    <section data-cursor-anchor="blog">
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="section-label">writing</h2>
        {blogs.length > 2 && (
          <Link
            href="/blog"
            className="meta-tag hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
          >
            view all
          </Link>
        )}
      </div>
      <ul className="flex flex-col gap-4">
        {blogs.slice(0, 2).map((blog) => (
          <li key={blog.slug}>
            <Link
              href={blog.url}
              onClick={() =>
                track("content_card_clicked", {
                  kind: "blog",
                  slug: blog.slug,
                  title: blog.title,
                })
              }
              className="group flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
            >
              <span className="squiggle-link-hover text-[14px] font-medium text-foreground sm:truncate">
                {blog.title}
              </span>
              <span className="meta-tag whitespace-nowrap shrink-0">
                {blog.formattedDate}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
