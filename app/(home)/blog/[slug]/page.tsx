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
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8 lg:py-12">
      {/* Blog Header */}
      <header className="mb-8 sm:mb-12 lg:mb-16">
        <div className="space-y-4 sm:space-y-6">
          <HeadlineLarge
            text={props.frontMatter.title}
            showAsterisk
            className="text-foreground !mb-0"
          />
          
          {/* Description */}
          <div className="max-w-2xl">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {props.frontMatter.description}
            </p>
          </div>
          
          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground/80">
            <time className="flex items-center gap-2">
              <span className="w-1 h-1 bg-highlight rounded-full"></span>
              {new Date(props.frontMatter.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 bg-muted-foreground/40 rounded-full"></span>
              {Math.ceil(props.content.split(' ').length / 200)} min read
            </span>
          </div>
        </div>
      </header>

      {/* Blog Content */}
      <article className="prose prose-lg max-w-none text-muted-foreground">
        <MDX source={props.content} />
      </article>
      
      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-border/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground/60">
            Thanks for reading! 
          </div>
          <a 
            href="/blog"
            className="text-sm text-highlight hover:text-highlight/80 transition-colors duration-200 flex items-center gap-1"
          >
            ← Back to all posts
          </a>
        </div>
      </footer>
    </div>
  );
}
