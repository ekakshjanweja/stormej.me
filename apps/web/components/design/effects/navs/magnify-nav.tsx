"use client";

// adapted from magic ui's dock (magicui.design)
import {
	type MotionValue,
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from "framer-motion";
import {
	Archive,
	Briefcase,
	FolderGit2,
	House,
	type LucideIcon,
	Moon,
	PenLine,
	Sun,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
	type PointerEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { track } from "@/lib/analytics";
import { useFinePointer } from "../use-media-query";
import type { NavLinkItem } from "./tabs-links";

const ICONS: Record<string, LucideIcon> = {
	"/": House,
	"/blog": PenLine,
	"/projects": FolderGit2,
	"/trove": Archive,
	"/work": Briefcase,
};

const SIZE = 40;
const MAGNIFIED = 62;
/** how far either side of an icon the cursor still swells it, in px */
const REACH = 140;
const SWELL = { damping: 14, mass: 0.1, stiffness: 170 };

const isWithin = (pathname: string, href: string) =>
	pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

/** an icon that swells as the cursor nears it along the dock */
function DockItem({
	children,
	label,
	magnify,
	mouseX,
}: {
	children: ReactNode;
	label: string;
	magnify: boolean;
	mouseX: MotionValue<number>;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const distance = useTransform(mouseX, (x) => {
		const bounds = ref.current?.getBoundingClientRect();
		return bounds ? x - bounds.x - bounds.width / 2 : Number.POSITIVE_INFINITY;
	});
	const target = useTransform(
		distance,
		[-REACH, 0, REACH],
		[SIZE, magnify ? MAGNIFIED : SIZE, SIZE]
	);
	const size = useSpring(target, SWELL);

	return (
		<motion.div
			className="dock-item"
			ref={ref}
			style={{ height: size, width: size }}
		>
			{children}
			<span aria-hidden="true" className="dock-label">
				{label}
			</span>
		</motion.div>
	);
}

function DockLink({
	item,
	magnify,
	mouseX,
	pathname,
}: {
	item: NavLinkItem;
	magnify: boolean;
	mouseX: MotionValue<number>;
	pathname: string;
}) {
	const Icon = ICONS[item.href] ?? House;
	const onClick = useCallback(
		() =>
			track("nav_link_clicked", {
				href: item.href,
				label: item.label,
				surface: "dock",
			}),
		[item.href, item.label]
	);

	return (
		<DockItem label={item.label} magnify={magnify} mouseX={mouseX}>
			<Link
				aria-current={pathname === item.href ? "page" : undefined}
				aria-label={item.label}
				className="dock-button"
				data-active={isWithin(pathname, item.href) || undefined}
				href={item.href}
				onClick={onClick}
			>
				<Icon aria-hidden="true" className="dock-icon" strokeWidth={1.6} />
			</Link>
		</DockItem>
	);
}

function DockTheme({
	magnify,
	mouseX,
}: {
	magnify: boolean;
	mouseX: MotionValue<number>;
}) {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const dark = mounted && resolvedTheme === "dark";
	const label = dark ? "light mode" : "dark mode";

	const toggle = useCallback(() => {
		const next = dark ? "light" : "dark";
		track("theme_toggled", { source: "dock", to: next });
		setTheme(next);
	}, [dark, setTheme]);

	return (
		<DockItem label={label} magnify={magnify} mouseX={mouseX}>
			<button
				aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
				className="dock-button"
				disabled={!mounted}
				onClick={toggle}
				type="button"
			>
				{dark ? (
					<Sun aria-hidden="true" className="dock-icon" strokeWidth={1.6} />
				) : (
					<Moon aria-hidden="true" className="dock-icon" strokeWidth={1.6} />
				)}
			</button>
		</DockItem>
	);
}

/**
 * The "magnify" navbar: a macOS-style icon dock pinned to the bottom of the
 * screen. Icons swell with the cursor's distance on fine pointers; touch
 * screens get the same dock without the swell. Keyboard shortcuts still
 * live in the Navbar that renders this.
 */
export function MagnifyNav({
	items,
	pathname,
}: {
	items: NavLinkItem[];
	pathname: string;
}) {
	const magnify = useFinePointer();
	const mouseX = useMotionValue(Number.POSITIVE_INFINITY);

	const onMove = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			if (event.pointerType === "mouse") {
				mouseX.set(event.clientX);
			}
		},
		[mouseX]
	);
	const onLeave = useCallback(
		() => mouseX.set(Number.POSITIVE_INFINITY),
		[mouseX]
	);

	return (
		<nav aria-label="Main" className="site-nav nav-dock">
			<div className="dock" onPointerLeave={onLeave} onPointerMove={onMove}>
				{items.map((item) => (
					<DockLink
						item={item}
						key={item.href}
						magnify={magnify}
						mouseX={mouseX}
						pathname={pathname}
					/>
				))}
				<span aria-hidden="true" className="dock-separator" />
				<DockTheme magnify={magnify} mouseX={mouseX} />
			</div>
		</nav>
	);
}
