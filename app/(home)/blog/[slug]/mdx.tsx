/* eslint-disable @typescript-eslint/no-explicit-any */

import { MDXRemote } from "next-mdx-remote/rsc";
import Code from "./_components/code-component/code";

function Table({ data }: { data: { headers: string[]; rows: string[][] } }) {
  const headers = data.headers.map((header, index) => (
    <th key={index} className="p-2 text-left">
      {header}
    </th>
  ));
  const rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex} className="p-2 text-left">
          {cell}
        </td>
      ))}
    </tr>
  ));

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function YouTube({ videoId }: { videoId: string }) {
  const videoSrc = `https://www.youtube.com/embed/${videoId}`;
  return (
    <div className="my-6">
      <iframe
        className="w-full aspect-video"
        src={videoSrc}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}

const components = {
  a: (props: React.HTMLProps<HTMLAnchorElement>) => (
    <a
      className="text-highlight font-normal underline hover:opacity-75 transition-all duration-100"
      {...props}
    />
  ),
  strong: (props: React.HTMLProps<HTMLSpanElement>) => (
    <strong className="font-semibold text-foreground pr-2" {...props} />
  ),

  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={props.alt}
      className="rounded-lg my-8 shadow-md mx-auto max-w-full"
      {...props}
    />
  ),
  h1: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold text-foreground mt-12 mb-4" {...props} />
  ),
  h2: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h2
      className="text-2xl font-semibold text-foreground mt-8 mb-3"
      {...props}
    />
  ),
  h3: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h3 className="text-xl font-medium text-foreground mt-6 mb-2" {...props} />
  ),
  h4: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h4 className="text-lg font-medium text-foreground mt-4 mb-2" {...props} />
  ),
  h5: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h5 className="text-sm font-medium text-foreground mt-2 mb-1" {...props} />
  ),
  p: (props: React.HTMLProps<HTMLParagraphElement>) => (
    <p
      className="text-base leading-relaxed text-muted-foreground my-4"
      {...props}
    />
  ),
  ul: (props: React.HTMLProps<HTMLUListElement>) => (
    <ul className="list-disc ml-6 my-4 space-y-2" {...props} />
  ),
  ol: (props: React.HTMLProps<HTMLOListElement>) => {
    // Destructure 'type' from props to avoid passing it if it's not a valid value
    const { type, ...rest } = props;
    return (
      <ol
        className="list-decimal ml-6 my-4 space-y-2"
        {...rest}
        // Only pass type if it's a valid value for ol elements
        type={type as "a" | "i" | "1" | "A" | "I" | undefined}
      />
    );
  },
  li: (props: React.HTMLProps<HTMLLIElement>) => (
    <li className="text-base text-muted-foreground" {...props} />
  ),
  blockquote: (props: React.HTMLProps<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 italic my-6 text-muted-foreground"
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
