"use client";

// adapted from motion-primitives' animated-background (motion-primitives.com)
import { AnimatePresence, motion, type Transition } from "framer-motion";
import Link from "next/link";
import { type FocusEvent, useCallback, useId, useState } from "react";
import { useDesign } from "@/components/design/preview-bridge";
import { track } from "@/lib/analytics";
import { motionTokens } from "@/lib/design/options";
import { cn } from "@/lib/utils";

export interface NavLinkItem {
	href: string;
	label: string;
	shortcut: string;
}

/** the pill rests on a section's link on its sub-pages too */
const isWithin = (pathname: string, href: string) =>
	pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

function TabLink({
	current,
	focusRing,
	highlighted,
	item,
	onPoint,
	pillId,
	transition,
}: {
	current: boolean;
	focusRing: string;
	highlighted: boolean;
	item: NavLinkItem;
	onPoint: (href: string) => void;
	pillId: string;
	transition: Transition;
}) {
	const point = useCallback(() => onPoint(item.href), [item.href, onPoint]);
	const onClick = useCallback(
		() =>
			track("nav_link_clicked", {
				href: item.href,
				label: item.label,
				surface: "desktop",
			}),
		[item.href, item.label]
	);

	return (
		<Link
			aria-current={current ? "page" : undefined}
			className={cn("nav-link nav-tab", focusRing)}
			data-highlighted={highlighted || undefined}
			href={item.href}
			onClick={onClick}
			onFocus={point}
			onPointerEnter={point}
		>
			<AnimatePresence initial={false}>
				{highlighted ? (
					<motion.span
						animate={{ opacity: 1 }}
						className="nav-tab-pill"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						layoutId={pillId}
						transition={transition}
					/>
				) : null}
			</AnimatePresence>
			<span className="nav-tab-label">{item.label}</span>
		</Link>
	);
}

/**
 * The "tabs" navbar's desktop links: a pill slides under whichever link is
 * pointed at or focused, and settles back on the current section's link.
 */
export function TabsLinks({
	focusRing,
	items,
	pathname,
}: {
	focusRing: string;
	items: NavLinkItem[];
	pathname: string;
}) {
	const pillId = useId();
	const { design } = useDesign();
	const [pointed, setPointed] = useState<string | null>(null);

	const tokens = motionTokens(design);
	const transition: Transition = tokens.spring
		? { type: "spring", ...tokens.spring }
		: { duration: tokens.duration * 0.6, ease: tokens.ease };

	const resting = items.find((item) => isWithin(pathname, item.href))?.href;
	const highlighted = pointed ?? resting ?? null;

	const clear = useCallback(() => setPointed(null), []);
	const onBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
		const next = event.relatedTarget;
		if (!(next instanceof Node && event.currentTarget.contains(next))) {
			setPointed(null);
		}
	}, []);

	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: The wrapper tracks focus and pointer across its interactive links.
		<div
			aria-label="section links"
			className="nav-links nav-tabs hidden items-center md:ml-auto md:flex"
			onBlur={onBlur}
			onPointerLeave={clear}
			role="toolbar"
		>
			{items.map((item) => (
				<TabLink
					current={pathname === item.href}
					focusRing={focusRing}
					highlighted={highlighted === item.href}
					item={item}
					key={item.href}
					onPoint={setPointed}
					pillId={pillId}
					transition={transition}
				/>
			))}
		</div>
	);
}
