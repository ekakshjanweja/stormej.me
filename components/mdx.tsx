import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Banner } from "fumadocs-ui/components/banner";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Callout } from "fumadocs-ui/components/callout";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import * as React from "react";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { GithubInfo } from "fumadocs-ui/components/github-info";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { InlineTOC } from "fumadocs-ui/components/inline-toc";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import { Mermaid } from "./mdx/mermaid";
import { Screens } from "./mdx/screens";
import { Figure } from "./mdx/figure";
import { Gallery } from "./mdx/gallery";
import { Highlights } from "./mdx/highlights";
import { Outcomes } from "./mdx/outcomes";
import { Links } from "./mdx/links";
import { ChapterNav } from "./mdx/chapter-nav";
import { StoreLinks } from "./mdx/store-links";

// Bridge old callout types to Fumadocs types so existing posts keep rendering.
type LegacyCalloutType = "note" | "tip" | "warning" | "danger";
type FumaCalloutType = "info" | "warn" | "error" | "success";

const calloutTypeMap: Record<LegacyCalloutType, FumaCalloutType> = {
  note: "info",
  tip: "success",
  warning: "warn",
  danger: "error",
};

function MappedCallout({
  type,
  title,
  children,
}: {
  type?: LegacyCalloutType | FumaCalloutType;
  title?: string;
  children: React.ReactNode;
}) {
  const fumaType =
    type && type in calloutTypeMap
      ? calloutTypeMap[type as LegacyCalloutType]
      : (type as FumaCalloutType | undefined);
  return (
    <Callout type={fumaType} title={title}>
      {children}
    </Callout>
  );
}

// Custom video embed kept for legacy posts.
function Yt({ videoId }: { videoId: string }) {
  return (
    <div className="my-8 overflow-hidden rounded-lg border border-border/30">
      <iframe
        title={`YouTube ${videoId}`}
        className="w-full aspect-video"
        src={`https://www.youtube.com/embed/${videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

// Side-by-side comparison kept for legacy posts.
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
      <section className="rounded-md border border-border/30 p-4">
        <h4 className="section-label mb-3">{leftTitle}</h4>
        <div className="text-sm leading-relaxed text-muted-foreground [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
          {left}
        </div>
      </section>
      <section className="rounded-md border border-border/30 p-4">
        <h4 className="section-label mb-3">{rightTitle}</h4>
        <div className="text-sm leading-relaxed text-muted-foreground [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
          {right}
        </div>
      </section>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="meta-tag inline-flex items-center rounded border border-border/40 px-1.5 py-0.5 align-middle">
      {children}
    </span>
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    // Fumadocs UI components — available in any MDX file.
    Accordion,
    Accordions,
    Banner,
    Card,
    Cards,
    Callout: MappedCallout,
    File,
    Files,
    Folder,
    GithubInfo,
    ImageZoom,
    InlineTOC,
    Step,
    Steps,
    Tab,
    Tabs,
    TypeTable,
    Mermaid,
    // Custom legacy components used by existing content.
    Yt,
    Compare,
    Badge,
    Screens,
    Figure,
    Gallery,
    Highlights,
    Outcomes,
    Links,
    ChapterNav,
    StoreLinks,
    CodeBlock,
    Pre,
    // Click-to-zoom for inline images.
    img: (props) => (
      <ImageZoom {...(props as React.ComponentProps<typeof ImageZoom>)} />
    ),
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
