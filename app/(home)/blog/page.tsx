import Card from "@/components/card";
import { TextScramble } from "@/components/ui/text-scramble";
import { getBlogs } from "@/lib/fetcher";

export default function Blog() {
  const blogs = getBlogs();

  blogs.sort((a, b) => {
    return new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime();
  });

  return (
    <main>
      {/* Page Header */}
      <div className="mb-12 sm:mb-16 lg:mb-20">
        <TextScramble
          as="h1"
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground"
        >
          blogs
        </TextScramble>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          thoughts and experiences
        </p>
      </div>

      {/* Blog Posts */}
      <div className="space-y-2">
        {blogs.map((blog, index) => (
          <div
            key={blog.slug}
            className="animate-in slide-in-from-bottom-4 duration-700"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <Card
              title={blog.meta.title}
              date={blog.formattedDate}
              description={blog.meta.description}
              href={`/blog/${blog.slug}`}
              type="blog"
            />
          </div>
        ))}
      </div>

      {/* Footer section for better spacing */}
      <div className="mt-16 pt-8 border-t border-border/30 text-center">
        <p className="text-sm text-muted-foreground/60">
          {blogs.length} {blogs.length === 1 ? 'post' : 'posts'} published
        </p>
      </div>
    </main>
  );
}
