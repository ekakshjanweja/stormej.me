import type { ReactNode } from "react";

/**
 * Every long page shares one shape: an overview panel fixed to the left edge
 * of the window, top to bottom (the heading, what the project is, the facts,
 * the demo film), and the story on the right, read top to bottom with screens
 * right where the text needs them. The navbar and the footer sit on the right
 * too (see SiteChrome), so the panel is never cut. On phones the panel
 * becomes a band across the top, then the story.
 */
export function StoryLayout({
	intro,
	aside,
	header,
	children,
}: {
	/** the page's heading and overview, in the panel */
	intro?: ReactNode;
	/** more for the panel under the heading (an index of the story) */
	aside?: ReactNode;
	/** media that opens the story */
	header?: ReactNode;
	children: ReactNode;
}) {
	return (
		// on wide screens the grid reaches out to the window's left edge; its
		// first column only holds the panel's place
		<div className="lg:-mt-10 lg:ml-[calc(50%-50vw)] lg:grid lg:grid-cols-[var(--story-panel)_minmax(0,1fr)]">
			{/* on short windows a long panel scrolls on its own; lenis leaves it be */}
			<aside
				className="-mx-4 mb-12 space-y-10 bg-card px-4 py-8 lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:m-0 lg:w-(--story-panel) lg:overflow-y-auto lg:border-border lg:border-r lg:px-12 lg:py-8 lg:[scrollbar-width:none]"
				data-lenis-prevent
			>
				{intro}
				{aside}
			</aside>
			<div className="min-w-0 lg:col-start-2 lg:pt-10 lg:pb-24 lg:pl-16 xl:pl-24">
				<div className="lg:max-w-[46rem]">
					{header && <div className="mb-16">{header}</div>}
					{children}
				</div>
			</div>
		</div>
	);
}
