"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import { listPublications } from "@/lib/publication";
import { PublicationListItemRow } from "./publication-list-item";

const HOME_LIMIT = 2;

export const PublicationsRow = () => {
  const publications = listPublications();
  if (publications.length === 0) return null;

  return (
    <section data-cursor-anchor="publications">
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="section-label">publications</h2>
        {publications.length > HOME_LIMIT && (
          <Link
            href="/publications"
            onClick={() =>
              track("nav_link_clicked", {
                href: "/publications",
                label: "view all",
                surface: "home_publications",
              })
            }
            className="meta-tag hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
          >
            view all
          </Link>
        )}
      </div>
      <ul className="flex flex-col gap-4">
        {publications.slice(0, HOME_LIMIT).map((pub) => (
          <li key={pub.slug}>
            <PublicationListItemRow pub={pub} location="home" />
          </li>
        ))}
      </ul>
    </section>
  );
};
