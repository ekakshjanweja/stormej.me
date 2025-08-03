/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Metadata } from "next";
import { MDX } from "./mdx";
import Link from "next/link";

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
    <main>
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 mb-12 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:gap-3"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
            ←
          </span>
          <span className="relative">
            back to blogs
            <span className="absolute inset-x-0 bottom-0 h-px bg-foreground/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </span>
        </Link>

        {/* Blog Header */}
        <div className="mb-16">
          <div className="space-y-6">
            {/* 1. Title */}
            <p className="text-xl md:text-2xl font-semibold tracking-tight">
              {props.frontMatter.title}
            </p>

            {/* 2. Meta information */}
            <div className="text-sm text-muted-foreground font-medium">
              {new Date(props.frontMatter.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              • {Math.ceil(props.content.split(" ").length / 200)} min read
            </div>

            {/* 3. Description */}
            <p className="text-muted-foreground leading-relaxed">
              {props.frontMatter.description}
            </p>
          </div>
        </div>

        {/* Blog Content */}
        <article className="prose prose-lg max-w-none text-muted-foreground">
          <MDX source={props.content} />
        </article>
      </div>
    </main>
  );
}
