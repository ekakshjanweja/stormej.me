"use client";

import { HuggingFaceChip } from "@/components/hugging-face-chip";
import { LinkPreview } from "@/components/ui/link-preview";
import {
	type PublicationClickLocation,
	trackPublicationClicked,
} from "@/lib/analytics";
import type { PublicationListItem } from "@/lib/publication";

const linkClassName =
	"group min-w-0 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded";

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

	return (
		<div className="flex flex-col gap-1">
			<div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
				<LinkPreview
					className={linkClassName}
					onClick={location ? handleClick : undefined}
					url={pub.paperUrl}
				>
					<span className="squiggle-link-hover line-clamp-3 font-medium text-[14px] text-foreground leading-snug">
						{pub.title}
					</span>
				</LinkPreview>
				{chipUrl || meta ? (
					<span className="flex shrink-0 items-center gap-2.5">
						{chipUrl ? (
							<HuggingFaceChip
								compact
								downloads={pub.downloads}
								url={chipUrl}
							/>
						) : null}
						{meta ? (
							<span className="meta-tag whitespace-nowrap">{meta}</span>
						) : null}
					</span>
				) : null}
			</div>
			{showDescription && pub.description ? (
				<span className="line-clamp-2 font-light text-[12px] text-muted-foreground leading-snug">
					{pub.description}
				</span>
			) : null}
		</div>
	);
}
