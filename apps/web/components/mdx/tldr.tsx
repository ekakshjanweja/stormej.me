import type * as React from "react";

/**
 * the outcomes as a short dashed list: spacing, not hairlines, keeps the
 * lines apart.
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
			<div className="mt-4 max-w-[60ch] [&_li]:relative [&_li]:pl-5 [&_li]:font-light [&_li]:text-[15px] [&_li]:text-foreground [&_li]:leading-[1.5] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-muted-foreground/50 [&_li]:before:content-['—'] [&_p]:font-light [&_p]:text-[15px] [&_p]:text-foreground [&_p]:leading-[1.7] [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:m-0 [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:p-0">
				{children}
			</div>
		</section>
	);
}
