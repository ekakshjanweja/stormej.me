/* eslint-disable @typescript-eslint/no-explicit-any */

import { MDXRemote } from "next-mdx-remote/rsc";
import Code from "./_components/code-component/code";

function Table({ data }: { data: { headers: string[]; rows: string[][] } }) {
  const headers = data.headers.map((header, index) => (
    <th
      key={index}
      className="p-3 sm:p-4 text-left text-sm font-semibold text-foreground bg-muted/30 first:rounded-tl-lg last:rounded-tr-lg border-b border-border/30"
    >
      {header}
    </th>
  ));
  const rows = data.rows.map((row, index) => (
    <tr
      key={index}
      className="hover:bg-muted/10 transition-colors duration-200"
    >
      {row.map((cell, cellIndex) => (
        <td
          key={cellIndex}
          className="p-3 sm:p-4 text-sm text-muted-foreground border-b border-border/20 last:border-b-0"
        >
          {cell}
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="my-8 sm:my-12 overflow-hidden rounded-lg border border-border/10 bg-muted/30 shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

function YouTube({ videoId }: { videoId: string }) {
  const videoSrc = `https://www.youtube.com/embed/${videoId}`;
  return (
    <div className="my-8 sm:my-12">
      <div className="relative rounded-lg overflow-hidden shadow-sm border border-border/10 bg-muted/30 hover:shadow-md transition-shadow duration-300">
        <iframe
          className="w-full aspect-video"
          src={videoSrc}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

const components = {
  a: (props: React.HTMLProps<HTMLAnchorElement>) => (
    <a
      className="text-primary font-medium underline underline-offset-2 hover:text-primary/80 hover:underline-offset-4 transition-all duration-200 decoration-primary/60 hover:decoration-primary"
      {...props}
    />
  ),
  strong: (props: React.HTMLProps<HTMLSpanElement>) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),

  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={props.alt}
      className="rounded-lg my-8 sm:my-12 shadow-sm mx-auto max-w-full border border-border/10 bg-muted/30 hover:shadow-md transition-shadow duration-300"
      {...props}
    />
  ),
  h1: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground mt-12 mb-6">
      {props.children}
    </h1>
  ),
  h2: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h2 className="text-lg md:text-xl font-semibold tracking-tight text-foreground mt-10 mb-4">
      {props.children}
    </h2>
  ),
  h3: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h3 className="text-base md:text-lg font-medium text-foreground mt-8 mb-3 flex items-center gap-2">
      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full flex-shrink-0"></span>
      {props.children}
    </h3>
  ),
  h4: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h4 className="text-sm md:text-base font-medium text-foreground mt-6 mb-2">
      {props.children}
    </h4>
  ),
  h5: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h5 className="text-xs md:text-sm font-medium text-foreground mt-4 mb-2">
      {props.children}
    </h5>
  ),
  p: (props: React.HTMLProps<HTMLParagraphElement>) => (
    <p className="text-sm text-muted-foreground leading-relaxed my-6">
      {props.children}
    </p>
  ),
  ul: (props: React.HTMLProps<HTMLUListElement>) => (
    <ul className="list-none ml-0 my-6 space-y-3" {...props} />
  ),
  ol: (props: React.HTMLProps<HTMLOListElement>) => {
    // Destructure 'type' from props to avoid passing it if it's not a valid value
    const { type, ...rest } = props;
    return (
      <ol
        className="list-decimal ml-6 my-6 space-y-3 marker:text-muted-foreground/60"
        {...rest}
        // Only pass type if it's a valid value for ol elements
        type={type as "a" | "i" | "1" | "A" | "I" | undefined}
      />
    );
  },
  li: (props: React.HTMLProps<HTMLLIElement>) => (
    <li className="text-sm text-muted-foreground relative pl-6 before:content-['→'] before:absolute before:left-0 before:text-muted-foreground/60 before:font-mono">
      {props.children}
    </li>
  ),
  blockquote: (props: React.HTMLProps<HTMLQuoteElement>) => (
    <blockquote className="relative border-l-4 border-border/30 bg-muted/30 pl-6 pr-4 py-4 my-8 italic text-muted-foreground rounded-r-lg">
      {props.children}
    </blockquote>
  ),
  pre: Code,
  Yt: YouTube,
  Table,
};

export function MDX(props: any) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components ?? {}) }}
    />
  );
}
