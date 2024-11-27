/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Metadata } from "next";
import HeadlineLarge from "@/components/styles/headline-large";
import { MDX } from "./mdx";

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
      <HeadlineLarge
        text={props.frontMatter.title}
        showAsterisk
        className="text-foreground"
      />
      <div className="text-foreground opacity-80 text-base">
        <p>{props.frontMatter.description}</p>
        <p>
          {new Date(props.frontMatter.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <MDX source={props.content} />
    </article>
  );
}
