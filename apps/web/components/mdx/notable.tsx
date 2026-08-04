import type * as React from "react";
import { Links } from "./links";

interface NotableLink {
	href: string;
	label: string;
}

/**
 * lead block for the thing worth knowing before the case study. rendered as a
 * bordered panel so it reads as a callout rather than another chapter.
 */
export function Notable({
	id = "notable",
	label = "notable",
	title,
	children,
	links,
}: {
	id?: string;
	label?: string;
	title: string;
	children?: React.ReactNode;
	links?: NotableLink[];
}) {
	return (
		<section
			className="scroll-mt-32 rounded-xl border border-border/60 bg-foreground/[0.015] px-5 py-5 sm:px-6 sm:py-6"
			id={id}
		>
			<span className="meta-tag text-[var(--text-highlight)] tracking-[0.18em]">
				{label}
			</span>
			<h2 className="headline mt-3 max-w-[40ch] text-[clamp(20px,2.2vw,26px)]">
				{title}
			</h2>
			{children && (
				<div className="mt-4 max-w-[60ch] space-y-3 [&_p]:font-light [&_p]:text-[14px] [&_p]:text-muted-foreground [&_p]:leading-[1.65] [&_section]:my-4 [&_strong]:font-medium [&_strong]:text-foreground">
					{children}
				</div>
			)}
			{links && links.length > 0 && <Links items={links} />}
		</section>
	);
}
