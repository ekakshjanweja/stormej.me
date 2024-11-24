import type { MDXComponents } from "mdx/types";
import Code from "./components/mdx/code-component/code";
import YouTube from "./components/mdx/youtube";

function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}

export const MdxComponents = useMDXComponents({
  h1: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h1
      className="text-2xl font-semibold text-foreground"
      style={{
        margin: "32px 0",
      }}
      {...props}
    />
  ),

  h2: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h2 className="text-xl font-semibold text-foreground" {...props} />
  ),

  p: (props: React.HTMLProps<HTMLParagraphElement>) => (
    <p className="leading-8 text-sm" {...props} />
  ),

  h3: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h3 className="text-sm font-semibold text-foreground my-12" {...props} />
  ),

  a: (props: React.HTMLProps<HTMLAnchorElement>) => (
    <a
      className="text-muted-foreground font-normal underline underline-offset-4 hover:text-foreground"
      {...props}
    />
  ),

  strong: (props: React.HTMLProps<HTMLSpanElement>) => (
    <strong className="font-semibold pr-2 mt-4" {...props} />
  ),

  img: (props: React.HTMLProps<HTMLImageElement>) => (
    <img
      className="my-16"
      style={{
        margin: "16px 0",
        borderRadius: "0.3rem",
      }}
      {...props}
    />
  ),

  pre: Code,

  Yt: YouTube,
});
