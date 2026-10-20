"use client";

import Link from "next/link";
import { useCallback } from "react";
import { LogoReveal } from "@/components/showcase/logo-reveal";
import { ShowcaseCard } from "@/components/showcase/showcase-card";
import { track } from "@/lib/analytics";
import {
	formatTotalExperienceAriaLabel,
	formatTotalExperienceShort,
	listWork,
	listWorkForHome,
} from "@/lib/work";

type WorkItem = ReturnType<typeof listWork>[number];

/** "fpv labs - infrastructure for physical intelligence" → "fpv labs" */
function shortName(title: string) {
	return title.split(" - ")[0] ?? title;
}

function formatYears(start: Date, end?: Date | null) {
	const from = start.getFullYear();
	if (!end) {
		return `${from} to now`;
	}
	const to = end.getFullYear();
	return from === to ? `${from}` : `${from} to ${to}`;
}

export function WorkCard({ item }: { item: WorkItem }) {
	const onClick = useCallback(
		() =>
			track("content_card_clicked", {
				kind: "work",
				slug: item.slug,
				title: item.title,
			}),
		[item.slug, item.title]
	);

	return (
		<li>
			<ShowcaseCard
				accent={item.accent}
				aspectClassName="aspect-[4/3]"
				detail={formatYears(item.startDate, item.endDate)}
				href={`/work/${item.slug}`}
				media={
					<LogoReveal
						images={item.images}
						logo={item.logo}
						title={shortName(item.title)}
					/>
				}
				meta={item.role}
				onClick={onClick}
				title={shortName(item.title)}
			/>
		</li>
	);
}

export default function Work() {
	const work = listWork();
	const totalExp = formatTotalExperienceShort(work);
	const totalExpAria = formatTotalExperienceAriaLabel(work);
	const homeWork = listWorkForHome();
	return (
		<section data-cursor-anchor="work">
			<div className="mb-6 flex items-baseline justify-between gap-4">
				<h2 className="section-label inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5">
					<span>work</span>
					{totalExp ? (
						<span aria-label={totalExpAria} className="meta-tag" role="note">
							({totalExp})
						</span>
					) : null}
				</h2>
				<Link
					className="meta-tag hover-dim rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
					href="/work"
				>
					view all
				</Link>
			</div>
			<ul className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-3">
				{homeWork.map((item) => (
					<WorkCard item={item} key={item.slug} />
				))}
			</ul>
		</section>
	);
}
