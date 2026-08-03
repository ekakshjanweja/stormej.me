import type * as React from "react";

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
		<section className="scroll-mt-32 space-y-4" id={id}>
			<span className="meta-tag text-foreground tracking-[0.18em]">
				{label}
			</span>
			<div className="max-w-[60ch] space-y-3 [&_li]:font-light [&_li]:text-[15px] [&_li]:text-foreground [&_li]:leading-[1.6] [&_p]:font-light [&_p]:text-[15px] [&_p]:text-foreground [&_p]:leading-[1.7] [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:m-0 [&_ul]:list-none [&_ul]:space-y-2 [&_ul]:p-0 [&_ul]:pl-0">
				{children}
			</div>
		</section>
	);
}
