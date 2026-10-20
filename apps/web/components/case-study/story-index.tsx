import type { TOCItemType } from "fumadocs-core/toc";
import type { ReactNode } from "react";

interface StoryIndexItem {
	id: string;
	label: ReactNode;
	/** a sub-part, listed indented under the part before it */
	sub?: boolean;
}

const TOP_DEPTH = 2;
const SUB_DEPTH = 3;
const LEADING_HASH = /^#/;

/** a page's h2s and h3s as index items */
export function tocItems(toc: TOCItemType[]): StoryIndexItem[] {
	return toc
		.filter((item) => item.depth === TOP_DEPTH || item.depth === SUB_DEPTH)
		.map((item) => ({
			id: item.url.replace(LEADING_HASH, ""),
			label: item.title,
			sub: item.depth === SUB_DEPTH,
		}));
}

/**
 * The story's parts as a short numbered list in the overview, each a jump
 * link. Static: it's a table of contents, not a progress tracker.
 */
export function StoryIndex({ items }: { items: StoryIndexItem[] }) {
	if (items.length === 0) {
		return null;
	}
	let part = 0;
	return (
		<nav aria-label="contents" className="hidden lg:block">
			<p className="meta-tag mb-3">contents</p>
			<ol className="space-y-1.5">
				{items.map((item) => {
					if (!item.sub) {
						part += 1;
					}
					return (
						<li className={item.sub ? "pl-[30px]" : undefined} key={item.id}>
							<a
								className={`hover-dim inline-flex items-baseline gap-3 rounded text-[13px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${item.sub ? "text-muted-foreground" : "text-foreground"}`}
								href={`#${item.id}`}
							>
								{!item.sub && (
									<span className="font-mono text-[10px] text-muted-foreground tabular-nums">
										{String(part).padStart(2, "0")}
									</span>
								)}
								{item.label}
							</a>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
