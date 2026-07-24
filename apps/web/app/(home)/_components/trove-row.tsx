"use client";

import Link from "next/link";
import { TrovePreview } from "@/components/trove/trove-preview";
import { track } from "@/lib/analytics";
import { listTrove } from "@/lib/trove";

const HOME_LIMIT = 2;

export const TroveRow = () => {
	const items = listTrove();
	if (items.length === 0) {
		return null;
	}

	return (
		<section data-cursor-anchor="trove">
			<div className="mb-6 flex items-baseline justify-between">
				<h2 className="section-label">trove</h2>
				{items.length > HOME_LIMIT && (
					<Link
						className="meta-tag hover-dim rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
						href="/trove"
						onClick={() =>
							track("nav_link_clicked", {
								href: "/trove",
								label: "view all",
								surface: "home_trove",
							})
						}
					>
						view all
					</Link>
				)}
			</div>
			<ul className="flex flex-col gap-4">
				{items.slice(0, HOME_LIMIT).map((item) => (
					<li key={item.slug}>
						<TrovePreview
							demo={item.demo}
							surface="home_trove"
							title={item.title}
						>
							<Link
								className="group flex flex-col gap-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
								href={item.url}
								onClick={() =>
									track("nav_link_clicked", {
										href: item.url,
										label: item.title,
										surface: "home_trove",
									})
								}
							>
								<div className="flex min-w-0 flex-col gap-0.5">
									<span className="squiggle-link-hover font-medium text-[14px] text-foreground sm:truncate">
										{item.title}
									</span>
									{(item.description ?? item.subtitle) && (
										<span className="font-light text-[12px] text-muted-foreground leading-snug sm:line-clamp-1">
											{item.description ?? item.subtitle}
										</span>
									)}
								</div>
								<span className="meta-tag shrink-0 whitespace-nowrap tabular-nums">
									{item.sourceFile ?? item.tech.join(" · ")}
								</span>
							</Link>
						</TrovePreview>
					</li>
				))}
			</ul>
		</section>
	);
};
