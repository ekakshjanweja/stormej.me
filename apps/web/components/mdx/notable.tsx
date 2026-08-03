import type * as React from "react";
import { Links } from "./links";

interface NotableLink {
	href: string;
	label: string;
}

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
		<section className="scroll-mt-32 space-y-4" id={id}>
			<span className="meta-tag text-foreground tracking-[0.18em]">
				{label}
			</span>
			<h2 className="headline max-w-[40ch] text-[clamp(22px,2.4vw,28px)]">
				{title}
			</h2>
			{children && (
				<div className="max-w-[60ch] space-y-3 [&_p]:font-light [&_p]:text-[15px] [&_p]:text-foreground [&_p]:leading-[1.7] [&_strong]:font-medium [&_strong]:text-foreground">
					{children}
				</div>
			)}
			{links && links.length > 0 && <Links items={links} />}
		</section>
	);
}
