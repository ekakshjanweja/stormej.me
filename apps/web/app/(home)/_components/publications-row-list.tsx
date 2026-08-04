"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import type { PublicationListItem } from "@/lib/publication";
import { PublicationListItemRow } from "./publication-list-item";

const trackViewAll = () =>
	track("nav_link_clicked", {
		href: "/publications",
		label: "view all",
		surface: "home_publications",
	});

interface PublicationsRowListProps {
	publications: PublicationListItem[];
	showViewAll: boolean;
}

export const PublicationsRowList = ({
	publications,
	showViewAll,
}: PublicationsRowListProps) => (
	<section data-cursor-anchor="publications">
		<div className="mb-6 flex items-baseline justify-between">
			<h2 className="section-label">publications</h2>
			{showViewAll && (
				<Link
					className="meta-tag hover-dim rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
					href="/publications"
					onClick={trackViewAll}
				>
					view all
				</Link>
			)}
		</div>
		<ul className="flex flex-col gap-4">
			{publications.map((pub) => (
				<li key={pub.slug}>
					<PublicationListItemRow location="home" pub={pub} />
				</li>
			))}
		</ul>
	</section>
);
