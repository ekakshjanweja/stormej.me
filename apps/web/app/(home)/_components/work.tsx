"use client";

import Link from "next/link";
import { useCallback } from "react";
import { LogoTile } from "@/components/logo-tile";
import { WorkPreview } from "@/components/work-preview";
import { track } from "@/lib/analytics";
import {
	formatTotalExperienceAriaLabel,
	formatTotalExperienceShort,
	listWork,
	listWorkForHome,
} from "@/lib/work";

function formatRange(start: Date, end?: Date | null) {
	const fmt = (d: Date) =>
		d
			.toLocaleString("default", { month: "short", year: "numeric" })
			.toLowerCase();
	return `${fmt(start)} to ${end ? fmt(end) : "present"}`;
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
						<span
							aria-label={totalExpAria}
							className="meta-tag normal-case tracking-[0.06em]"
							role="note"
						>
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
			<ul className="flex flex-col">
				{homeWork.map((item) => (
					<HomeWorkItem item={item} key={item.slug} />
				))}
			</ul>
		</section>
	);
}

function HomeWorkItem({
	item,
}: {
	item: ReturnType<typeof listWorkForHome>[number];
}) {
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
		<li className="group/work relative py-4 first:pt-0 last:pb-0">
			<WorkPreview
				href={`/work/${item.slug}`}
				images={item.images}
				logo={item.logo}
				screenshotMockup={item.screenshotMockup}
				title={item.title}
			>
				<Link
					className="group flex items-center gap-4 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
					href={`/work/${item.slug}`}
					onClick={onClick}
				>
					{item.logo ? (
						<LogoTile boxClassName="h-9 w-9" src={item.logo} />
					) : (
						<span
							aria-hidden
							className="w-9 shrink-0 select-none text-center font-serif text-[34px] text-foreground/85 italic leading-none"
							style={{
								fontFamily: "var(--font-instrument-serif), serif",
							}}
						>
							{item.title.charAt(0).toLowerCase()}
						</span>
					)}
					<div className="flex min-w-0 flex-1 items-center justify-between gap-3 sm:gap-4">
						<div className="flex min-w-0 flex-1 flex-col gap-0.5">
							<span className="squiggle-link-hover truncate font-medium text-[14px] text-foreground">
								{item.title}
							</span>
							<span className="font-light text-[12px] text-muted-foreground leading-tight">
								{item.role}
							</span>
							<span className="meta-tag mt-0.5 whitespace-nowrap sm:hidden">
								{formatRange(item.startDate, item.endDate)}
							</span>
						</div>
						<span className="meta-tag hidden shrink-0 whitespace-nowrap sm:inline">
							{formatRange(item.startDate, item.endDate)}
						</span>
					</div>
				</Link>
			</WorkPreview>
		</li>
	);
}
