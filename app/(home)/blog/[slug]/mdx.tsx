/* eslint-disable @typescript-eslint/no-explicit-any */

import { MDXRemote } from "next-mdx-remote/rsc";
import Code from "./_components/code-component/code";

type CalloutType = "note" | "tip" | "warning" | "danger";

function Table({ data }: { data: { headers: string[]; rows: string[][] } }) {
  const headers = data.headers.map((header, index) => (
    <th
      key={index}
      className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/90 bg-muted/50 first:rounded-tl-xl last:rounded-tr-xl border-b border-border/40"
    >
      {header}
    </th>
  ));
  const rows = data.rows.map((row, index) => (
    <tr
      key={index}
      className="transition-colors duration-200 hover:bg-muted/20 even:bg-muted/[0.06]"
    >
      {row.map((cell, cellIndex) => (
        <td
          key={cellIndex}
          className="px-3 py-2.5 text-xs md:text-sm text-muted-foreground border-b border-border/25 last:border-b-0"
        >
          {cell}
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-border/20 bg-card/40 shadow-sm ring-1 ring-border/10">
      <table className="w-full min-w-[20rem] border-collapse text-left">
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
    <div className="my-8">
      <div className="relative overflow-hidden rounded-xl border border-border/20 bg-muted/20 shadow-sm ring-1 ring-border/10 transition-shadow duration-300 hover:shadow-md">
        <iframe
          title={`YouTube embed ${videoId}`}
          className="w-full aspect-video"
          src={videoSrc}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function Callout({
  type = "note",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}) {
  const variants: Record<
    CalloutType,
    { shell: string; stripe: string; label: string }
  > = {
    note: {
      shell:
        "border-border/20 bg-muted/20 text-muted-foreground dark:bg-muted/15",
      stripe: "bg-foreground/20",
      label: "text-foreground/85",
    },
    tip: {
      shell:
        "border-border/20 bg-muted/20 text-muted-foreground dark:bg-muted/15",
      stripe: "bg-emerald-500/45",
      label: "text-foreground/85",
    },
    warning: {
      shell:
        "border-border/20 bg-muted/20 text-muted-foreground dark:bg-muted/15",
      stripe: "bg-amber-500/50",
      label: "text-foreground/85",
    },
    danger: {
      shell:
        "border-border/20 bg-muted/20 text-muted-foreground dark:bg-muted/15",
      stripe: "bg-rose-500/50",
      label: "text-foreground/85",
    },
  };

  const config = variants[type];

  return (
    <aside
      className={`relative my-8 overflow-hidden rounded-lg border ring-1 ring-border/5 ${config.shell}`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-0.5 ${config.stripe}`}
      />
      <div className="py-3.5 pl-4 pr-4 md:py-4 md:pl-5 md:pr-5">
        {title ? (
          <p
            className={`mb-1.5 text-[0.72rem] font-semibold uppercase tracking-wide ${config.label}`}
          >
            {title}
          </p>
        ) : null}
        <div className="text-sm leading-relaxed md:text-base [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ol]:my-2">
          {children}
        </div>
      </div>
    </aside>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return (
    <ol className="my-4 list-decimal space-y-2.5 rounded-lg p-4 pl-8 text-sm leading-relaxed text-muted-foreground marker:font-medium marker:text-muted-foreground/70 md:pl-9 md:text-base [&>li]:pl-1">
      {children}
    </ol>
  );
}

function Compare({
  leftTitle,
  rightTitle,
  left,
  right,
}: {
  leftTitle: string;
  rightTitle: string;
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      <section className="rounded-md border border-border/20 bg-muted/15 p-4">
        <h4 className="mb-2 text-sm font-semibold text-foreground md:text-base">
          {leftTitle}
        </h4>
        <div className="text-sm leading-relaxed text-muted-foreground md:text-base [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ol]:my-2">
          {left}
        </div>
      </section>
      <section className="rounded-md border border-border/20 bg-muted/15 p-4">
        <h4 className="mb-2 text-sm font-semibold text-foreground md:text-base">
          {rightTitle}
        </h4>
        <div className="text-sm leading-relaxed text-muted-foreground md:text-base [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ol]:my-2">
          {right}
        </div>
      </section>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-border/35 bg-muted/30 px-1.5 py-0.5 text-[0.72rem] font-medium text-muted-foreground align-middle">
      {children}
    </span>
  );
}

const components = {
  a: (props: React.HTMLProps<HTMLAnchorElement>) => (
    <a
      className="font-medium text-primary underline decoration-primary/35 underline-offset-[3px] transition-colors hover:text-primary/85 hover:decoration-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
      {...props}
    />
  ),
  strong: (props: React.HTMLProps<HTMLSpanElement>) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  em: (props: React.HTMLProps<HTMLSpanElement>) => (
    <em className="italic text-foreground/90" {...props} />
  ),
  code: (props: React.HTMLProps<HTMLElement>) => (
    <code
      className="rounded-md border border-border/35 bg-muted/60 px-1.5 py-px text-[0.9em] font-mono text-foreground [pre_&]:border-0 [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:text-inherit"
      {...props}
    />
  ),

  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={props.alt}
      className="mx-auto my-8 max-h-[min(70vh,48rem)] max-w-full rounded-xl border border-border/15 bg-muted/20 object-contain shadow-sm ring-1 ring-border/10 transition-shadow duration-300 hover:shadow-md"
      {...props}
    />
  ),
  h1: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h1 className="scroll-mt-24 mt-10 mb-5 text-xl font-semibold tracking-tight text-foreground first:mt-0 md:text-2xl">
      {props.children}
    </h1>
  ),
  h2: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h2 className="scroll-mt-24 mt-10 mb-3 border-b border-border/35 pb-2 text-base font-semibold tracking-tight text-foreground md:text-lg">
      {props.children}
    </h2>
  ),
  h3: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h3 className="scroll-mt-24 mt-8 mb-3 flex items-start gap-2.5 text-sm font-semibold tracking-tight text-foreground md:text-base">
      <span aria-hidden className="mt-2 h-px w-6 shrink-0 bg-primary/35" />
      <span className="min-w-0 flex-1">{props.children}</span>
    </h3>
  ),
  h4: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h4 className="scroll-mt-24 mt-6 mb-2 text-sm font-semibold text-foreground md:text-base">
      {props.children}
    </h4>
  ),
  h5: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h5 className="scroll-mt-24 mt-5 mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:text-sm">
      {props.children}
    </h5>
  ),
  p: (props: React.HTMLProps<HTMLParagraphElement>) => (
    <p className="my-4 text-sm leading-[1.75] text-muted-foreground md:text-base md:leading-[1.7]">
      {props.children}
    </p>
  ),
  ul: (props: React.HTMLProps<HTMLUListElement>) => (
    <ul
      className="my-5 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-primary/45 md:text-base [&_ol]:my-3 [&_ul]:my-3 [&_ul]:list-[circle]"
      {...props}
    />
  ),
  ol: (props: React.HTMLProps<HTMLOListElement>) => {
    // Destructure 'type' from props to avoid passing it if it's not a valid value
    const { type, ...rest } = props;
    return (
      <ol
        className="my-5 list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-muted-foreground/70 md:text-base [&_ol]:my-3 [&_ul]:my-3"
        {...rest}
        // Only pass type if it's a valid value for ol elements
        type={type as "a" | "i" | "1" | "A" | "I" | undefined}
      />
    );
  },
  li: (props: React.HTMLProps<HTMLLIElement>) => (
    <li className="leading-relaxed [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>ul]:mt-2 [&>ol]:mt-2">
      {props.children}
    </li>
  ),
  blockquote: (props: React.HTMLProps<HTMLQuoteElement>) => (
    <blockquote className="relative my-8 rounded-r-xl border-l-[3px] border-primary/35 bg-gradient-to-r from-muted/40 to-muted/15 py-4 pl-5 pr-4 text-sm italic leading-relaxed text-muted-foreground shadow-sm ring-1 ring-border/10 md:text-base [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
      {props.children}
    </blockquote>
  ),
  hr: () => <hr className="my-12 border-0 border-t border-border/50" />,
  pre: Code,
  Yt: YouTube,
  Table,
  Callout,
  Steps,
  Compare,
  Badge,
};

export function MDX(props: any) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components ?? {}) }}
    />
  );
}
