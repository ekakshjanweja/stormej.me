"use client";

// biome-ignore lint/performance/noNamespaceImport: Radix exports the hover card primitives as a namespace
import * as HoverCard from "@radix-ui/react-hover-card";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useCallback, useState } from "react";
import { getHostname, siteScreenshotUrl } from "@/components/ui/link-preview";
import type { ProjectListItem } from "@/lib/projects";
import { cn } from "@/lib/utils";

interface ProjectPreviewProps {
	children: ReactNode;
	project: ProjectListItem;
}

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 180;
const WINDOW_DOTS = ["close", "minimise", "zoom"] as const;

/** A tiny browser window: the real address up top, the live site below. */
function PreviewWindow({ project }: { project: ProjectListItem }) {
	const { slug, website } = project;
	const ogCard = `/og/projects/${slug}`;
	const [src, setSrc] = useState(() =>
		website
			? siteScreenshotUrl(website, {
					height: PREVIEW_HEIGHT,
					isMobile: false,
					width: PREVIEW_WIDTH,
				})
			: ogCard
	);
	const [loaded, setLoaded] = useState(false);

	const onLoad = useCallback(() => setLoaded(true), []);
	// a site that can't be captured still gets a preview
	const onError = useCallback(() => setSrc(ogCard), [ogCard]);

	const address = website
		? getHostname(website)
		: `stormej.me/projects/${slug}`;

	return (
		<>
			<div className="flex items-center gap-2 border-border/70 border-b bg-muted/40 px-2.5 py-1.5">
				<span aria-hidden className="flex shrink-0 gap-1">
					{WINDOW_DOTS.map((dot) => (
						<span
							className="h-1.5 w-1.5 rounded-full bg-foreground/15"
							key={dot}
						/>
					))}
				</span>
				<span className="min-w-0 flex-1 truncate text-center font-mono text-[10px] text-muted-foreground tracking-wide">
					{address}
				</span>
				{website ? (
					<ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground" />
				) : (
					<span aria-hidden className="w-3 shrink-0" />
				)}
			</div>
			<div className="relative aspect-[16/9] overflow-hidden bg-muted">
				{!loaded && (
					<div
						aria-hidden
						className="absolute inset-0 animate-pulse bg-muted"
					/>
				)}
				<Image
					alt={`preview of ${address}`}
					className={cn(
						"object-cover object-top transition-opacity duration-300",
						loaded ? "opacity-100" : "opacity-0"
					)}
					fill
					onError={onError}
					onLoad={onLoad}
					sizes={`${PREVIEW_WIDTH}px`}
					src={src}
					unoptimized
				/>
			</div>
		</>
	);
}

export function ProjectPreview({ children, project }: ProjectPreviewProps) {
	return (
		<HoverCard.Root closeDelay={100} openDelay={160}>
			<HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
			<HoverCard.Portal>
				<HoverCard.Content
					align="start"
					avoidCollisions
					className="data-[state=open]:fade-in data-[state=open]:zoom-in-95 z-[100] max-h-[calc(100dvh-24px)] w-[min(320px,calc(100dvw-24px))] overflow-hidden rounded-md border border-border bg-popover shadow-lg outline-none data-[state=open]:animate-in"
					collisionPadding={12}
					side="top"
					sideOffset={10}
					sticky="always"
				>
					{project.website ? (
						<a
							aria-label={`open ${getHostname(project.website)}`}
							className="block transition-opacity hover:opacity-90"
							href={project.website}
							rel="noopener noreferrer"
							target="_blank"
						>
							<PreviewWindow project={project} />
						</a>
					) : (
						<PreviewWindow project={project} />
					)}
				</HoverCard.Content>
			</HoverCard.Portal>
		</HoverCard.Root>
	);
}
