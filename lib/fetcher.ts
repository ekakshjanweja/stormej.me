import fs from "fs";
import path from "path";
import matter from "gray-matter";

/** Parsed MDX front matter for blog posts. */
export type BlogPostMeta = {
  title: string;
  date: string;
  description: string;
  /** Omit or `true` to show on `/blog`; `false` hides from listings only. */
  published?: boolean;
};

/** Missing `published` is treated as true (backward compatible). */
export function isPublishedMeta(meta: BlogPostMeta): boolean {
  return meta.published !== false;
}

export type GetBlogsOptions = {
  /** When true, includes posts with `published: false`. Default: false. */
  includeUnpublished?: boolean;
};

export const getBlogs = (options?: GetBlogsOptions) => {
  const blogDirectory = path.join(process.cwd(), "content");
  const fileNames = fs.readdirSync(blogDirectory);

  const blogs = fileNames.map((fileName) => {
    const slug = fileName.replace(".mdx", "");
    const fullPath = path.join(blogDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const { data: frontMatter } = matter(fileContents);
    const meta = frontMatter as BlogPostMeta;

    const date = new Date(meta.date as string);

    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      slug,
      formattedDate,
      meta,
    };
  });

  const includeUnpublished = options?.includeUnpublished ?? false;
  if (includeUnpublished) {
    return blogs;
  }

  return blogs.filter((blog) => isPublishedMeta(blog.meta));
};

export function getPostBySlug(slug: string) {
  return getBlogs({ includeUnpublished: true }).find(
    (post) => post.slug === slug
  ) ?? null;
}
