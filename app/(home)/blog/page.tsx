import Card from "@/components/card";
import { SectionType } from "@/components/section";
import HeadlineLarge from "@/components/styles/headline-large";
import { getBlogs } from "@/lib/fetcher";

export default function Blog() {
  const blogs = getBlogs();

  blogs.sort((a, b) => {
    return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
  });

  return (
    <>
      <div>
        <HeadlineLarge text="blogs" showAsterisk />

        <main className="gap-4 text-muted-foreground">
          {blogs.map((blog) => (
            <Card
              key={blog.slug}
              date={blog.formattedDate}
              role=""
              description={blog.meta.description}
              title={blog.meta.title}
              href={`/blog/${blog.slug}`}
            />
          ))}
        </main>
      </div>
    </>
  );
}
