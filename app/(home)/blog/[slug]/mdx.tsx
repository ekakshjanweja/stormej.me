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
      className="text-muted-foreground font-normal underline hover:text-highlight"
      {...props}
    />
  ),
  strong: (props: React.HTMLProps<HTMLSpanElement>) => (
    <strong className="font-semibold pr-2 mt-4" {...props} />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={props.alt} className="rounded-lg my-[2rem]" {...props} />
  ),

  h1: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h1
      className="text-2xl font-semibold text-foreground mt-[3rem] mb-[0.2rem]"
      {...props}
    />
  ),
  h2: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h2
      className="text-xl font-semibold text-foreground"
      style={{
        marginTop: "1.5rem",
        marginBottom: "0.3rem",
      }}
      {...props}
    />
  ),
  h3: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h3
      className="text-sm font-semibold text-foreground mt-[1rem] mb-[0.3rem]"
      {...props}
    />
  ),
  p: (props: React.HTMLProps<HTMLParagraphElement>) => (
    <p className="text-sm leading-6" {...props} />
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
