import type * as React from "react";

/**
 * the outcomes, as divided rows. hairlines instead of bullets keep it reading
 * like a spec sheet rather than a paragraph broken into pieces.
 */
export function Tldr({
	id = "tldr",
	label = "tldr",
	children,
}: {
	id?: string;
	label?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="scroll-mt-32" id={id}>
			<span className="meta-tag text-foreground tracking-[0.18em]">
				{label}
			</span>
			<div className="mt-3 max-w-[60ch] [&_li:first-child]:border-t-0 [&_li:first-child]:pt-0 [&_li]:border-border/50 [&_li]:border-t [&_li]:py-2.5 [&_li]:font-light [&_li]:text-[15px] [&_li]:text-foreground [&_li]:leading-[1.5] [&_p]:font-light [&_p]:text-[15px] [&_p]:text-foreground [&_p]:leading-[1.7] [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:m-0 [&_ul]:list-none [&_ul]:space-y-0 [&_ul]:p-0">
				{children}
			</div>
		</section>
	);
}
