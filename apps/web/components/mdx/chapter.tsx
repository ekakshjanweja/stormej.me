import type * as React from "react";
import { Spread } from "@/components/case-study/spread";
import type { WorkImageAsset } from "@/lib/types/types";

/**
 * A numbered chapter of a case study. Its text always sits in the page's
 * reading column; with screens, they sit large beside it (a spread).
 */
export function Chapter({
	id,
	label,
	title,
	pullQuote,
	index,
	media,
	landscape,
	children,
}: {
	id: string;
	label: string;
	title: string;
	pullQuote?: string;
	index: number;
	media?: WorkImageAsset[];
	landscape?: boolean;
	children?: React.ReactNode;
}) {
	const body = (
		<>
			<div className="flex items-baseline gap-3">
				<span className="font-mono text-[11px] text-muted-foreground tabular-nums">
					{String(index + 1).padStart(2, "0")}
				</span>
				<span className="meta-tag">{label}</span>
			</div>
			<h2 className="headline max-w-[30ch] text-[clamp(24px,2.6vw,32px)] leading-[1.15]">
				{title}
			</h2>
			{children && (
				<div className="max-w-[62ch] space-y-4 [&_p]:text-[16px] [&_p]:text-foreground [&_p]:leading-[1.75] [&_strong]:font-semibold [&_strong]:text-foreground">
					{children}
				</div>
			)}
			{pullQuote && (
				<blockquote className="mt-6 max-w-[55ch] border-foreground/30 border-l-2 pl-5 font-light text-[17px] text-foreground italic leading-[1.55]">
					{pullQuote}
				</blockquote>
			)}
		</>
	);

	if (media && media.length > 0) {
		return (
			<Spread id={id} label={label} landscape={landscape} media={media}>
				{body}
			</Spread>
		);
	}

	return (
		<section className="scroll-mt-32 space-y-4" id={id}>
			{body}
		</section>
	);
}
