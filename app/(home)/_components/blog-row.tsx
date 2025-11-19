import { getBlogs } from "@/lib/fetcher";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BlogRow = async () => {
  const blogs = await getBlogs();

  blogs.sort((a, b) => {
    return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
  });

  return (
    <>
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg md:text-xl font-semibold tracking-tight">
            blogs
          </h2>
          {blogs.length > 2 && (
            <Link
              href="/blog"
              className="group relative px-2.5 py-1.5 rounded-lg transition-all duration-300 ease-in-out hover:translate-x-0.5 focus:translate-x-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 border border-transparent text-muted-foreground hover:text-foreground hover:border-border/20 hover:bg-accent/10 text-sm"
            >
              <span className="font-medium transition-all duration-300 ease-in-out">
                view all
              </span>
            </Link>
          )}
        </div>
        <div className="flex flex-col gap-4">
          {blogs.slice(0, 2).map((blog, index) => (
            <Link key={blog.slug} href={`/blog/${blog.slug}`} className="group">
              <div
                className={cn(
                  "group relative overflow-hidden rounded-lg",
                  "border border-border/10 bg-muted/30",
                  "hover:border-border/50 dark:hover:border-border/40",
                  "hover:bg-muted/50 dark:hover:bg-card/70",
                  "backdrop-blur-sm transition-all duration-700 ease-in-out",
                  "cursor-pointer p-3",
                  "hover:shadow-md hover:shadow-primary/10 dark:hover:shadow-primary/5",
                  "transform-gpu"
                )}
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/5 dark:via-transparent dark:to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out" />

                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out bg-gradient-to-r from-transparent via-primary/5 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100" />

                {/* Content */}
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm md:text-base font-semibold tracking-tight text-foreground group-hover:text-primary/95 transition-colors duration-700 ease-in-out">
                      {blog.meta.title}
                    </h3>
                  </div>
                  <div className="text-left md:text-right mt-1 md:mt-0">
                    <p className="text-xs md:text-sm text-muted-foreground/70 transition-colors duration-700 ease-in-out group-hover:text-muted-foreground/90">
                      {blog.formattedDate}
                    </p>
                  </div>
                </div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 transition-all duration-700 ease-in-out" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};
