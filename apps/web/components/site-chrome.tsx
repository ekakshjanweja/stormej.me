"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** pages that stand alone: no navbar, no footer, their own layout */
const BARE_ROUTES = new Set(["/about"]);

/** every detail page runs its content beside a pinned heading (StoryLayout),
 *  so they all open up to nearly the full width on large screens */
const WIDE_ROUTE = /^\/(work|projects|blog|publications|trove)\/[^/]+\/?$/;

/**
 * The column every page sits in, with the navbar above and the footer
 * below. Bare routes get the page and nothing else.
 */
export function SiteChrome({
	children,
	footer,
	nav,
}: {
	children: ReactNode;
	footer: ReactNode;
	nav: ReactNode;
}) {
	const pathname = usePathname();

	if (BARE_ROUTES.has(pathname)) {
		return (
			<main id="main-content" tabIndex={-1}>
				{children}
			</main>
		);
	}

	const wide = WIDE_ROUTE.test(pathname);

	return (
		<div className="flex w-full justify-center">
			<div
				className={cn(
					"flex min-h-screen w-full flex-col md:max-w-3xl lg:max-w-5xl",
					wide && "lg:max-w-6xl xl:max-w-[84rem]"
				)}
			>
				{/* beside the fixed overview panel, the navbar keeps to the right, its
				    brand lined up with the story */}
				<div
					className={cn(
						wide &&
							"lg:sticky lg:top-0 lg:z-50 lg:ml-[calc(var(--story-panel)-50vw+50%)] lg:[&>.site-nav]:pl-16 xl:[&>.site-nav]:pl-24"
					)}
				>
					{nav}
				</div>
				<main
					className={cn("flex-1 px-4 pb-8", wide && "lg:px-10 lg:pb-0")}
					id="main-content"
					tabIndex={-1}
				>
					{children}
				</main>
				{/* beside the fixed overview panel, the footer keeps to the right */}
				<div
					className={cn(
						wide &&
							"lg:ml-[calc(var(--story-panel)-50vw+50%)] lg:pl-12 xl:pl-20"
					)}
				>
					{footer}
				</div>
			</div>
		</div>
	);
}
