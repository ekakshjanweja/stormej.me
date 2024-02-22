import { getBlogs } from "@/lib/fetcher";
import Link from "next/link";

async function BlogsPage() {
  const blogs = await getBlogs();

  blogs.reverse();

  return (
    <main className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
      {blogs.map((blog) => (
        <div
          key={blog.slug}
          className="text-muted-foreground justify-start items-start p-4 flex flex-col leading-4 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-950"
        >
          <Link href={`/blogs/${blog.slug}`}>
            <p className="text-lg font-medium p-0 hover:text-foreground underline underline-offset-4 ">
              {blog.meta.title}
            </p>

            <div className="text-sm mt-4">{blog.meta.description}</div>
            <div className="text-sm mt-4">{blog.formattedDate}</div>
          </Link>
        </div>
      ))}
    </main>
  );
}

export default BlogsPage;
