"use client";

import { HuggingFaceChip } from "@/components/hugging-face-chip";
import { LinkPreview } from "@/components/ui/link-preview";
import {
	type PublicationClickLocation,
	trackPublicationClicked,
} from "@/lib/analytics";
import type { PublicationListItem } from "@/lib/publication";

const linkClassName =
	"group min-w-0 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2";

interface PublicationListItemRowProps {
	location?: PublicationClickLocation;
	pub: PublicationListItem;
	showDescription?: boolean;
}

export function PublicationListItemRow({
	pub,
	showDescription = false,
	location,
}: PublicationListItemRowProps) {
	const meta = pub.venue ?? pub.year ?? pub.formattedDate;
	// the chip is its own link, so it has to sit outside the row anchor
	const chipUrl = pub.huggingfaceUrl;

	const handleClick = () => {
		if (!location) {
			return;
		}
		trackPublicationClicked(pub, location);
	};

	// title gets the full width and the meta sits under it. squeezing the venue
	// and the chip into a right-hand column made the row read as three columns.
	return (
		<div className="flex flex-col gap-2">
			<LinkPreview
				className={linkClassName}
				onClick={location ? handleClick : undefined}
				url={pub.paperUrl}
			>
				<span className="squiggle-link-hover line-clamp-3 font-medium text-[14px] text-foreground leading-snug">
					{pub.title}
				</span>
			</LinkPreview>
			{showDescription && pub.description ? (
				<span className="line-clamp-2 font-light text-[12px] text-muted-foreground leading-snug">
					{pub.description}
				</span>
			) : null}
			{chipUrl || meta ? (
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
					{meta ? (
						<span className="meta-tag whitespace-nowrap">{meta}</span>
					) : null}
					{chipUrl ? (
						<HuggingFaceChip
							compact
							downloads={pub.downloads}
							type={pub.huggingfaceType}
							url={chipUrl}
						/>
					) : null}
				</div>
			) : null}
		</div>
	);
}
