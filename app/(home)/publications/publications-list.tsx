"use client";

import { useEffect } from "react";
import { trackPublicationsListViewed } from "@/lib/analytics";
import type { PublicationListItem } from "@/lib/publication";
import { PublicationListItemRow } from "../_components/publication-list-item";

export function PublicationsList({
  publications,
}: {
  publications: PublicationListItem[];
}) {
  useEffect(() => {
    trackPublicationsListViewed();
  }, []);

  return (
    <ul className="flex flex-col gap-5">
      {publications.map((pub) => (
        <li key={pub.slug}>
          <PublicationListItemRow
            pub={pub}
            showDescription
            location="publications"
          />
        </li>
      ))}
    </ul>
  );
}
