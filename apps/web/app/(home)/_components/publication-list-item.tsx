"use client";

import { LinkPreview } from "@/components/ui/link-preview";
import {
	type PublicationClickLocation,
	trackPublicationClicked,
} from "@/lib/analytics";
import type { PublicationListItem } from "@/lib/publication";

const rowClassName =
	"group flex flex-col gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded";

type PublicationListItemRowProps = {
	pub: PublicationListItem;
	showDescription?: boolean;
	location?: PublicationClickLocation;
};

export function PublicationListItemRow({
	pub,
	showDescription = false,
	location,
}: PublicationListItemRowProps) {
	const meta = pub.venue ?? pub.year ?? pub.formattedDate;

	const content = (
		<>
			<div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
				<span className="squiggle-link-hover line-clamp-3 min-w-0 font-medium text-[14px] text-foreground leading-snug">
					{pub.title}
				</span>
				{meta ? (
					<span className="meta-tag shrink-0 whitespace-nowrap">{meta}</span>
				) : null}
			</div>
			{showDescription && pub.description ? (
				<span className="line-clamp-2 font-light text-[12px] text-muted-foreground leading-snug">
					{pub.description}
				</span>
			) : null}
		</>
	);

	const handleClick = () => {
		if (!location) {
			return;
		}
		trackPublicationClicked(pub, location);
	};

	return (
		<LinkPreview
			className={rowClassName}
			onClick={location ? handleClick : undefined}
			url={pub.paperUrl}
		>
			{content}
		</LinkPreview>
	);
}
