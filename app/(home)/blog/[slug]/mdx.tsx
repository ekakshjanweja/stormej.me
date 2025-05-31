/* eslint-disable @typescript-eslint/no-explicit-any */

import { MDXRemote } from "next-mdx-remote/rsc";
import Code from "./_components/code-component/code";

function Table({ data }: { data: { headers: string[]; rows: string[][] } }) {
  const headers = data.headers.map((header, index) => (
    <th key={index} className="p-3 sm:p-4 text-left text-sm font-semibold text-foreground bg-muted/30 first:rounded-tl-lg last:rounded-tr-lg border-b border-border/30">
      {header}
    </th>
  ));
  const rows = data.rows.map((row, index) => (
    <tr key={index} className="hover:bg-muted/10 transition-colors duration-200">
      {row.map((cell, cellIndex) => (
        <td key={cellIndex} className="p-3 sm:p-4 text-sm text-muted-foreground border-b border-border/20 last:border-b-0">
          {cell}
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="my-8 sm:my-12 overflow-hidden rounded-lg border border-border/30 shadow-sm">
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
      <div className="relative rounded-xl overflow-hidden shadow-lg border border-border/20 hover:shadow-xl transition-shadow duration-300">
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
      className="text-highlight font-medium underline underline-offset-2 hover:text-highlight/80 hover:underline-offset-4 transition-all duration-200 decoration-highlight/60 hover:decoration-highlight"
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
      className="rounded-xl my-8 sm:my-12 shadow-lg mx-auto max-w-full border border-border/20 hover:shadow-xl transition-shadow duration-300"
      {...props}
    />
  ),
  h1: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-12 mb-6 relative group">
      <span className="relative z-10">{props.children}</span>
      <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-highlight to-accent rounded-full"></div>
    </h1>
  ),
  h2: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h2
      className="text-xl sm:text-2xl font-semibold text-foreground mt-10 mb-4 relative"
      {...props}
    />
  ),
  h3: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h3 className="text-lg sm:text-xl font-medium text-foreground mt-8 mb-3 flex items-center gap-2" {...props}>
      <span className="w-1.5 h-1.5 bg-highlight rounded-full"></span>
      {props.children}
    </h3>
  ),
  h4: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h4 className="text-base sm:text-lg font-medium text-foreground mt-6 mb-2" {...props} />
  ),
  h5: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h5 className="text-sm sm:text-base font-medium text-foreground mt-4 mb-2" {...props} />
  ),
  p: (props: React.HTMLProps<HTMLParagraphElement>) => (
    <p
      className="text-base sm:text-lg leading-relaxed text-muted-foreground my-6 max-w-none"
      {...props}
    />
  ),
  ul: (props: React.HTMLProps<HTMLUListElement>) => (
    <ul className="list-none ml-0 my-6 space-y-3" {...props} />
  ),
  ol: (props: React.HTMLProps<HTMLOListElement>) => {
    // Destructure 'type' from props to avoid passing it if it's not a valid value
    const { type, ...rest } = props;
    return (
      <ol
        className="list-decimal ml-6 my-6 space-y-3 marker:text-highlight"
        {...rest}
        // Only pass type if it's a valid value for ol elements
        type={type as "a" | "i" | "1" | "A" | "I" | undefined}
      />
    );
  },
  li: (props: React.HTMLProps<HTMLLIElement>) => (
    <li className="text-base sm:text-lg text-muted-foreground relative pl-6 before:content-['→'] before:absolute before:left-0 before:text-highlight before:font-mono" {...props} />
  ),
  blockquote: (props: React.HTMLProps<HTMLQuoteElement>) => (
    <blockquote
      className="relative border-l-4 border-highlight/60 bg-muted/20 pl-6 pr-4 py-4 my-8 italic text-muted-foreground rounded-r-lg"
      {...props}
    />
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
