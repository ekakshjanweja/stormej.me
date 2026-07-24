import type * as React from "react";

export function Chapter({
	id,
	label,
	title,
	pullQuote,
	index,
	children,
}: {
	id: string;
	label: string;
	title: string;
	pullQuote?: string;
	index: number;
	children: React.ReactNode;
}) {
	return (
		<section className="scroll-mt-32 space-y-5" id={id}>
			<div className="flex items-baseline gap-3">
				<span className="meta-tag tabular-nums">
					{String(index + 1).padStart(2, "0")}
				</span>
				<span className="meta-tag text-foreground tracking-[0.18em]">
					{label}
				</span>
			</div>
			<h2 className="headline max-w-[40ch] text-[clamp(22px,2.4vw,28px)]">
				{title}
			</h2>
			<div className="max-w-[60ch] space-y-4 [&_p]:font-light [&_p]:text-[15px] [&_p]:text-foreground [&_p]:leading-[1.7] [&_strong]:font-medium [&_strong]:text-foreground">
				{children}
			</div>
			{pullQuote && (
				<blockquote className="mt-6 max-w-[55ch] border-foreground/30 border-l-2 pl-5 font-light text-[17px] text-foreground italic leading-[1.55]">
					{pullQuote}
				</blockquote>
			)}
		</section>
	);
}
