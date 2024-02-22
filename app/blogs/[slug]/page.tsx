import { getAllBlogSlug, getBlogBySlug } from "@/lib/fetchers";

export async function generateStaticParams() {
  return getAllBlogSlug();
}

export default async function BlogPage({
  params,
}: {
  params: { slug: string };
}) {
  const blog = await getBlogBySlug(params.slug);
  return (
    <div className="text-muted-foreground">
      <main className="prose">
        <div className="prose prose-lg max-w-none animate-fade-in-up">
          {blog.content}
        </div>
      </main>
    </div>
  );
}
