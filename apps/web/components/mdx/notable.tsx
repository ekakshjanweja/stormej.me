import type * as React from "react";
import { Links } from "./links";

interface NotableLink {
	href: string;
	label: string;
}

/**
 * lead block for the thing worth knowing before the case study. a left accent
 * rule rather than a card, so it reads as a margin note next to the prose
 * instead of a boxed-off widget.
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
	title?: string;
	children?: React.ReactNode;
	links?: NotableLink[];
}) {
	return (
		<section
			className="scroll-mt-32 border-[var(--text-highlight)]/35 border-l-2 pl-5 sm:pl-6"
			id={id}
		>
			<span className="meta-tag text-[var(--text-highlight)] tracking-[0.18em]">
				{label}
			</span>
			{title && (
				<h2 className="headline mt-3 max-w-[40ch] text-[clamp(20px,2.2vw,26px)]">
					{title}
				</h2>
			)}
			{children && (
				<div className="mt-3 max-w-[60ch] space-y-3 [&_p]:font-light [&_p]:text-[14px] [&_p]:text-muted-foreground [&_p]:leading-[1.65] [&_section]:my-3.5 [&_strong]:font-medium [&_strong]:text-foreground">
					{children}
				</div>
			)}
			{links && links.length > 0 && <Links items={links} />}
		</section>
	);
}
