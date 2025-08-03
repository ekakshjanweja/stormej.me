import { getBlogs } from "@/lib/fetcher";
import Link from "next/link";

export default function Blog() {
  const blogs = getBlogs();

  blogs.sort((a, b) => {
    return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
  });

  return (
    <main>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          blogs
        </h1>
      </div>

      {/* Blog Posts */}
      <div className="flex flex-col gap-6">
        {blogs.map((blog) => (
          <Link key={blog.slug} href={`/blog/${blog.slug}`} className="group">
            <div className="group relative overflow-hidden rounded-lg border border-border/10 bg-muted/30 hover:border-border/30 hover:bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out cursor-pointer p-4 hover:shadow-sm hover:shadow-primary/5">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary/95 transition-colors duration-200">
                    {blog.meta.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium transition-colors duration-200">
                    {blog.meta.description}
                  </p>
                </div>
                <div className="text-left md:text-right mt-2 md:mt-0 flex-shrink-0">
                  <p className="text-sm text-muted-foreground/70 transition-colors duration-200 whitespace-nowrap">
                    {blog.formattedDate}
                  </p>
                </div>
              </div>

              {/* Subtle border animation */}
              <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-primary/20 transition-all duration-500" />
            </div>
          </Link>
        ))}
      </div>

      {/* Footer section for better spacing */}
      <div className="mt-16 pt-8 border-t border-border/30 text-center">
        <p className="text-sm text-muted-foreground/60">
          {blogs.length} {blogs.length === 1 ? "post" : "posts"} published
        </p>
      </div>
    </main>
  );
}
