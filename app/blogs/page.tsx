import { Button } from "@/components/ui/button";
import { getBlogs } from "@/lib/fetchers";
import Link from "next/link";

async function BlogsPage() {
  const blogs = await getBlogs();
  return (
    <main className="flex flex-col items-start justify-center w-screen gap-12 text-muted-foreground">
      {blogs.map((blog, i) => (
        <>
          <div className="">
            <Link href={`/blogs/${blog.slug}` || ""}>
              <div className="text-md font-semibold underline underline-offset-8 hover:text-foreground">
                {blog.frontmatter.title}
              </div>
              <p className="text-md mt-4">{blog.frontmatter.description}</p>
              <p className="text-sm mt-2">{blog.frontmatter.publishDate}</p>
            </Link>
          </div>
        </>
      ))}
    </main>
  );
}

export default BlogsPage;
