import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Banner } from "fumadocs-ui/components/banner";
import { Callout } from "fumadocs-ui/components/callout";
import { Card, Cards } from "fumadocs-ui/components/card";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { GithubInfo } from "fumadocs-ui/components/github-info";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { InlineTOC } from "fumadocs-ui/components/inline-toc";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type * as React from "react";
import { ChapterNav } from "./mdx/chapter-nav";
import { CopyFile } from "./mdx/copy-file";
import { Figure } from "./mdx/figure";
import { FlutterDemo } from "./mdx/flutter-demo";
import { Gallery } from "./mdx/gallery";
import { Highlights } from "./mdx/highlights";
import { HuggingFaceStat } from "./mdx/hugging-face-stat";
import { Lead } from "./mdx/lead";
import { Links } from "./mdx/links";
import { Mermaid } from "./mdx/mermaid";
import { Notable } from "./mdx/notable";
import { Outcomes } from "./mdx/outcomes";
import { Screens } from "./mdx/screens";
import { StoreLinks } from "./mdx/store-links";
import { Tldr } from "./mdx/tldr";

// Bridge old callout types to Fumadocs types so existing posts keep rendering.
type LegacyCalloutType = "note" | "tip" | "warning" | "danger";
type FumaCalloutType = "info" | "warn" | "error" | "success";

const calloutTypeMap: Record<LegacyCalloutType, FumaCalloutType> = {
	danger: "error",
	note: "info",
	tip: "success",
	warning: "warn",
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
		<Callout title={title} type={fumaType}>
			{children}
		</Callout>
	);
}

// Custom video embed kept for legacy posts.
function Yt({ videoId }: { videoId: string }) {
	return (
		<div className="my-8 overflow-hidden rounded-lg border border-border/30">
			<iframe
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className="aspect-video w-full"
				src={`https://www.youtube.com/embed/${videoId}`}
				title={`YouTube ${videoId}`}
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
				<div className="text-muted-foreground text-sm leading-relaxed [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_p]:my-2">
					{left}
				</div>
			</section>
			<section className="rounded-md border border-border/30 p-4">
				<h4 className="section-label mb-3">{rightTitle}</h4>
				<div className="text-muted-foreground text-sm leading-relaxed [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_p]:my-2">
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
		Badge,
		Banner,
		Callout: MappedCallout,
		Card,
		Cards,
		ChapterNav,
		CodeBlock,
		Compare,
		CopyFile,
		Figure,
		File,
		Files,
		FlutterDemo,
		Folder,
		Gallery,
		GithubInfo,
		Highlights,
		HuggingFaceStat,
		ImageZoom,
		InlineTOC,
		// Click-to-zoom for inline images.
		img: (props) => (
			<ImageZoom {...(props as React.ComponentProps<typeof ImageZoom>)} />
		),
		Lead,
		Links,
		Mermaid,
		Notable,
		Outcomes,
		Pre,
		pre: ({ ref: _ref, ...props }) => (
			<CodeBlock {...props}>
				<Pre>{props.children}</Pre>
			</CodeBlock>
		),
		Screens,
		Step,
		Steps,
		StoreLinks,
		Tab,
		Tabs,
		Tldr,
		TypeTable,
		// Custom legacy components used by existing content.
		Yt,
		...components,
	} satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
	type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
