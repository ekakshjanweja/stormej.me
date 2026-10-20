import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogoTile } from "@/components/logo-tile";
import type { WorkLogoAsset } from "@/lib/types/types";

export interface HeroFact {
	label: string;
	value: string;
}

export interface HeroLink {
	href: string;
	label: string;
}

/**
 * The opening of a long case study: who it was for, small; what the job was,
 * large; then the facts as two quiet lines (role and years, then the stack
 * and links). One idea per line of type,
 * so the page starts calm before the story and its screens take over. Sizes
 * follow its own width (container queries): it heads a ~600px text column
 * beside the screens, or runs the full page when there are none. On desktop
 * it heads the pinned overview (see StoryLayout), so it carries no outer
 * spacing of its own.
 */
export function CaseStudyHero({
	backHref,
	logo,
	name,
	href,
	headline,
	facts,
	links,
	notes,
	description,
	overview,
	children,
}: {
	backHref: string;
	logo?: WorkLogoAsset;
	name: string;
	/** the product's own site; the name links out to it */
	href?: string;
	headline?: string;
	facts: HeroFact[];
	links: HeroLink[];
	/** a few short lines under the headline (project highlights) */
	notes?: string[];
	/** a sentence under the headline (a post's summary) */
	description?: string;
	/** what the project is, a short paragraph under its own label */
	overview?: string;
	/** anything page-specific under the facts (dataset chips, agent setup) */
	children?: ReactNode;
}) {
	// the stack gets its own quieter line; everything else reads as one
	const stack = facts.find((fact) => fact.label === "stack");
	const primary = facts.filter((fact) => fact !== stack);

	return (
		<header className="@container flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<Link
					className="meta-tag hover-dim inline-flex items-center gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
					href={backHref}
				>
					← back
				</Link>
			</div>

			{/* wide: headline on the left, highlights beside it on the right */}
			<div className="@3xl:grid @3xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] @3xl:items-end @3xl:gap-x-16 @3xl:space-y-0 space-y-6">
				<div className="space-y-6">
					<div className="flex items-center gap-2.5">
						{logo && <LogoTile boxClassName="h-7 w-7" src={logo} />}
						{href ? (
							<a
								className="hover-dim inline-flex items-center gap-1 font-medium text-[15px] text-foreground"
								href={href}
								rel="noopener noreferrer"
								target="_blank"
							>
								{name}
								<ArrowUpRight
									aria-hidden
									className="h-3.5 w-3.5 text-muted-foreground"
								/>
							</a>
						) : (
							<span className="font-medium text-[15px] text-foreground">
								{name}
							</span>
						)}
					</div>

					{headline && (
						<h1 className="headline max-w-[32ch] @3xl:text-[clamp(30px,3.4vw,46px)] text-[clamp(24px,2.1vw,30px)] leading-[1.12] tracking-[-0.015em]">
							{headline}
						</h1>
					)}

					{description && (
						<p className="max-w-[56ch] text-pretty font-light text-[15px] text-muted-foreground leading-[1.6]">
							{description}
						</p>
					)}
				</div>

				{overview && (
					<div className="space-y-2.5">
						<p className="meta-tag">overview</p>
						<p className="max-w-[56ch] text-pretty font-light text-[14px] text-foreground/80 leading-[1.6]">
							{overview}
						</p>
					</div>
				)}

				{notes && notes.length > 0 && (
					<ul className="max-w-[60ch] space-y-2 @3xl:pb-2">
						{notes.map((line) => (
							<li
								className="flex gap-2.5 font-light text-[15px] text-muted-foreground leading-snug"
								key={line}
							>
								<span aria-hidden className="text-muted-foreground/50">
									—
								</span>
								{line}
							</li>
						))}
					</ul>
				)}
			</div>

			{/* no labels, no grid: the facts read as two quiet lines. the
			    labels stay for screen readers. */}
			<div className="space-y-2.5">
				{primary.length > 0 && (
					<dl className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[14px] text-foreground/80">
						{primary.map((fact, i) => (
							<div className="flex items-baseline gap-2.5" key={fact.label}>
								{i > 0 && (
									<span aria-hidden className="text-muted-foreground/50">
										·
									</span>
								)}
								<dt className="sr-only">{fact.label}</dt>
								<dd className="m-0">{fact.value}</dd>
							</div>
						))}
					</dl>
				)}
				{(stack || links.length > 0) && (
					<div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
						{stack ? (
							<p className="font-mono text-[11px] text-muted-foreground tracking-wide">
								<span className="sr-only">{stack.label}: </span>
								{stack.value}
							</p>
						) : (
							<span />
						)}
						{links.length > 0 && (
							<div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
								{links.map((link) => (
									<a
										className="hover-dim inline-flex items-center gap-1 text-foreground"
										href={link.href}
										key={link.label}
										rel="noopener noreferrer"
										target="_blank"
									>
										{link.label}
										<ArrowUpRight
											aria-hidden
											className="h-3 w-3 text-muted-foreground"
										/>
									</a>
								))}
							</div>
						)}
					</div>
				)}
			</div>
			{children}
		</header>
	);
}
