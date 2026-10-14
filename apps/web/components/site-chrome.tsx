"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** pages that stand alone: no navbar, no footer, their own layout */
const BARE_ROUTES = new Set(["/about"]);

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

	return (
		<div className="flex w-full justify-center">
			<div className="flex min-h-screen w-full flex-col md:max-w-3xl">
				{nav}
				<main className="flex-1 px-4 pb-8" id="main-content" tabIndex={-1}>
					{children}
				</main>
				{footer}
			</div>
		</div>
	);
}
