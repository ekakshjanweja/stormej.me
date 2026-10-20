"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { InlineClip } from "@/components/showcase/inline-clip";
import { ShowcaseCard } from "@/components/showcase/showcase-card";
import { YouTubeClip } from "@/components/showcase/youtube-clip";
import { track } from "@/lib/analytics";
import { packFullRows, packRows } from "@/lib/bento";
import { listProjects, type ProjectListItem } from "@/lib/projects";

/** desktop grid: three columns, a demo takes two of them */
const DESKTOP_COLUMNS = 3;
/** phones and tablets: two columns, a demo takes the full width */
const MOBILE_COLUMNS = 2;

const MOBILE_SPAN: Record<number, string> = {
	1: "col-span-1",
	2: "col-span-2",
};
const DESKTOP_SPAN: Record<number, string> = {
	1: "lg:col-span-1",
	2: "lg:col-span-2",
	3: "lg:col-span-3",
};

function hasDemo(project: ProjectListItem) {
	return project.cover?.kind === "video" || project.cover?.kind === "youtube";
}

/** a playing demo gets twice the room of a logo */
function cardWidth(project: ProjectListItem) {
	// a vertical demo is narrow: a wide card would be mostly empty sides
	const portrait = project.cover?.kind === "video" && project.cover.portrait;
	return hasDemo(project) && !portrait ? 2 : 1;
}

function DemoTag() {
	return (
		<span className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex h-6 items-center gap-1.5 rounded-full bg-background/85 px-2.5 font-medium text-[11px] text-foreground backdrop-blur">
			<Play aria-hidden className="h-2.5 w-2.5 fill-current" />
			demo
		</span>
	);
}

/** the project's logo, or the first letter of its name over a dot grid */
function Logo({ project }: { project: ProjectListItem }) {
	if (project.icon) {
		return (
			<div className="absolute inset-0 flex items-center justify-center">
				<Image
					alt=""
					className="project-logo h-[34%] w-auto rounded-[22%] shadow-[0_10px_24px_-12px_rgb(0_0_0/0.5)]"
					height={96}
					src={project.icon}
					width={96}
				/>
			</div>
		);
	}
	return (
		<div className="absolute inset-0 flex items-center justify-center">
			<span aria-hidden className="dot-field" />
			<span
				aria-hidden
				className="project-logo relative select-none font-serif text-[clamp(52px,6vw,76px)] text-foreground/75 italic leading-none"
			>
				{project.title.charAt(0)}
			</span>
		</div>
	);
}

/** a demo fills the card (muted, looping, only while on screen); otherwise the logo */
function ProjectMedia({ project }: { project: ProjectListItem }) {
	const { cover, title } = project;

	if (cover?.kind === "video") {
		return (
			<>
				{/* fills the card edge to edge; a tall clip is cropped, never boxed */}
				<InlineClip
					className="absolute inset-0"
					label={`${title} demo`}
					poster={cover.poster}
					src={cover.src}
				/>
				<DemoTag />
			</>
		);
	}

	if (cover?.kind === "youtube") {
		return (
			<>
				<YouTubeClip id={cover.id} start={cover.start} title={title} />
				<DemoTag />
			</>
		);
	}

	if (cover?.kind === "image") {
		return (
			<Image
				alt={`${title} preview`}
				className="object-cover object-top"
				fill
				sizes="(min-width: 1024px) 640px, 92vw"
				src={cover.src}
			/>
		);
	}

	return <Logo project={project} />;
}

/** "mac app · 2026" */
function kindLine(project: ProjectListItem) {
	return [project.kind, project.year].filter(Boolean).join(" · ");
}

function ProjectCard({
	project,
	mobileSpan,
	desktopSpan,
}: {
	project: ProjectListItem;
	mobileSpan: number;
	desktopSpan: number;
}) {
	// its own page when it has one, otherwise straight to its site
	const hasPage = Boolean(project.description);
	const isExternal = !hasPage && Boolean(project.website);
	const href = isExternal
		? (project.website as string)
		: `/projects/${project.slug}`;

	const onClick = useCallback(
		() =>
			track("content_card_clicked", {
				external: isExternal,
				kind: "project",
				slug: project.slug,
				title: project.title,
			}),
		[isExternal, project.slug, project.title]
	);

	return (
		<li className={`${MOBILE_SPAN[mobileSpan]} ${DESKTOP_SPAN[desktopSpan]}`}>
			<ShowcaseCard
				accent={project.accent}
				aspectClassName={`${mobileSpan > 1 ? "aspect-video" : "aspect-square"} lg:aspect-auto lg:h-[340px]`}
				detail={kindLine(project) || undefined}
				external={isExternal}
				href={href}
				media={<ProjectMedia project={project} />}
				meta={project.subtitle}
				onClick={onClick}
				title={project.title}
			/>
		</li>
	);
}

/**
 * Projects as a bento grid. On home only full rows make it (`fullRowsOnly`);
 * the list page shows every card and lets the last row stretch.
 */
export function ProjectGrid({
	projects,
	fullRowsOnly = false,
}: {
	projects: ProjectListItem[];
	fullRowsOnly?: boolean;
}) {
	const pack = fullRowsOnly ? packFullRows : packRows;
	// desktop decides which cards make it and their order
	const rows = pack(projects, DESKTOP_COLUMNS, cardWidth);
	// a lone logo card closing the list keeps its own size instead of
	// stretching across the whole grid
	const lastRow = rows.at(-1);
	const lonely = rows.length > 1 && lastRow?.length === 1 ? lastRow[0] : null;
	if (lonely) {
		lonely.span = cardWidth(lonely.item);
	}
	const desktop = rows.flat();
	// phones re-pack the same cards into two columns
	const mobileSpans = new Map(
		packRows(
			desktop.map(({ item }) => item),
			MOBILE_COLUMNS,
			cardWidth
		)
			.flat()
			.map(({ item, span }) => [item.slug, span])
	);

	return (
		<ul className="grid grid-flow-row-dense grid-cols-2 gap-x-4 gap-y-7 lg:grid-cols-3 lg:gap-x-5">
			{desktop.map(({ item, span }) => (
				<ProjectCard
					desktopSpan={span}
					key={item.slug}
					mobileSpan={mobileSpans.get(item.slug) ?? 1}
					project={item}
				/>
			))}
		</ul>
	);
}

export function Projects() {
	const all = listProjects().filter((p) => !p.hidden);
	const projects = all.filter((p) => !p.archived);
	const shown = packFullRows(projects, DESKTOP_COLUMNS, cardWidth).flat();
	const hasMore = all.length > shown.length;

	if (shown.length === 0) {
		return null;
	}

	return (
		<section data-cursor-anchor="projects">
			<div className="mb-6 flex items-baseline justify-between">
				<h2 className="section-label">projects</h2>
				{hasMore && (
					<Link
						className="meta-tag hover-dim rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
						href="/projects"
					>
						view all
					</Link>
				)}
			</div>
			<ProjectGrid fullRowsOnly projects={projects} />
		</section>
	);
}
