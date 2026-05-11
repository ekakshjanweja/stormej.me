import Link from "next/link";
import { listBlogs } from "@/lib/blog";

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
              className="group flex items-baseline justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="squiggle-link-hover text-[14px] font-medium text-foreground truncate">
                  {blog.title}
                </span>
                {blog.description && (
                  <span className="text-[12px] font-light text-muted-foreground leading-snug line-clamp-1">
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
