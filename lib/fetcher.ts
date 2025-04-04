import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const getBlogs = () => {
  const blogDirectory = path.join(process.cwd(), "content");
  const fileNames = fs.readdirSync(blogDirectory);

  const blogs = fileNames.map((fileName) => {
    const slug = fileName.replace(".mdx", "");
    const fullPath = path.join(blogDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const { data: frontMatter } = matter(fileContents);

    const date = new Date(frontMatter.date);

    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      slug,
      formattedDate,
      meta: frontMatter,
    };
  });

  return blogs;
};

export function getPostBySlug(slug: string) {
  return getBlogs().find((post) => post.slug === slug) ?? null;
}
