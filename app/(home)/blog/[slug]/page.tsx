/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { MdxComponents } from "@/mdx-components";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = await getPost(await params);
  const title = post.frontMatter.title;
  const description = post.frontMatter.description;

  return {
    title: title,
    description: description,
  };
}

async function getPost({ slug }: { slug: string }) {
  try {
    const markdownFile = fs.readFileSync(
      path.join("content", slug + ".mdx"),
      "utf-8"
    );

    const { data: frontMatter, content } = matter(markdownFile);
    return {
      frontMatter,
      slug,
      content,
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    throw new Error(`Unable to fetch the post for slug: ${slug}`);
  }
}

export async function generateStaticParams() {
  const files = fs.readdirSync(path.join("content"));
  const params = files.map((filename) => ({
    slug: filename.replace(".mdx", ""),
  }));

  return params;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const props = await getPost(await params);

  return (
    <article className="prose prose-lg md:prose-lg lg:prose-lg mx-auto text-muted-foreground">
      <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-200">
        {props.frontMatter.title}
      </h1>
      <MDXRemote source={props.content} components={MdxComponents} />
    </article>
  );
}
