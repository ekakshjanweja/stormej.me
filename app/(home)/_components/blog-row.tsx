import { getBlogs } from "@/lib/fetcher";
import { ProjectCard } from "./project-card";
import { projects } from "@/lib/projects";
import Link from "next/link";
import { ArrowBigRight, ChevronRight } from "lucide-react";

export const BlogRow = async () => {
  const blogs = await getBlogs();

  blogs.reverse();

  return (
    <>
      <div>
        <div className="font-semibold text-lg mt-16">Blogs</div>
        <div className="flex flex-col items-start justify-center gap-y-6 mt-8">
          {blogs.map(
            (blog, i) =>
              i < 5 && (
                <div
                  className=" w-full flex items-center justify-between"
                  key={blog.slug}
                >
                  <Link href={`/blogs/${blog.slug}`}>
                    <p className="underline text-muted-foreground hover:text-foreground underline-offset-4">
                      {blog.meta.title}
                    </p>
                  </Link>
                  <p className=" text-muted-foreground">{blog.formattedDate}</p>
                </div>
              )
          )}
        </div>
        <Link href="/blogs">
          <div className="mt-8 underline text-muted-foreground hover:text-foreground underline-offset-4 flex items-center ">
            <p>All posts </p>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>
      </div>
    </>
  );
};
