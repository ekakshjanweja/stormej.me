import type * as React from "react";
import { Links } from "./links";

interface NotableLink {
	href: string;
	label: string;
}

/**
 * lead block for the thing worth knowing before the case study. no card and
 * no rule: a coloured label is enough to set it apart from the prose.
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
		<section className="scroll-mt-32" id={id}>
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
