"use client";

import { LinkPreview } from "@/components/ui/link-preview";
import {
  trackPublicationClicked,
  type PublicationClickLocation,
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
        <span className="squiggle-link-hover min-w-0 text-[14px] font-medium leading-snug text-foreground line-clamp-3">
          {pub.title}
        </span>
        {meta ? (
          <span className="meta-tag shrink-0 whitespace-nowrap">{meta}</span>
        ) : null}
      </div>
      {showDescription && pub.description ? (
        <span className="text-[12px] font-light leading-snug text-muted-foreground line-clamp-2">
          {pub.description}
        </span>
      ) : null}
    </>
  );

  const handleClick = () => {
    if (!location) return;
    trackPublicationClicked(pub, location);
  };

  return (
    <LinkPreview
      url={pub.paperUrl}
      className={rowClassName}
      onClick={location ? handleClick : undefined}
    >
      {content}
    </LinkPreview>
  );
}
