import { getBlogs } from "@/lib/fetcher";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import HeadlineMedium from "@/components/styles/headline-medium";

export const BlogRow = async () => {
  const blogs = await getBlogs();

  blogs.sort((a, b) => {
    return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
  });

  return (
    <>
      <div className="mt-12">
        <HeadlineMedium text="blogs" showAsterisk />
        <div>
          {blogs.map(
            (blog, i) =>
              i < 2 && (
                <div
                  className="grid grid-cols-2 gap-2 items-center mt-4"
                  key={blog.slug}
                >
                  <Link href={`/blog/${blog.slug}`}>
                    <p className="text-sm flex items-center justify-start text-foreground opacity-80 hover:text-highlight">
                      {blog.meta.title}
                    </p>
                  </Link>
                  <p className="flex justify-end text-xs text-muted-foreground">
                    {blog.formattedDate}
                  </p>
                </div>
              )
          )}
        </div>
        {blogs.length > 2 && (
          <>
            <Link href={"/blog"}>
              <div className="group flex text-highlight items-center justify-start mt-8">
                <p className="group-hover:underline transition-all duration-300 ease-in-out">
                  {"all blogs"}
                </p>
                <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:scale-90 transition-all duration-200 ease-in-out" />{" "}
              </div>

              <p className="opacity-50 text-xs">{`(${blogs.length})`}</p>
            </Link>
          </>
        )}
      </div>
    </>
  );
};
