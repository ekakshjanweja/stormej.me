"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	type FocusEvent,
	type PointerEvent,
	useCallback,
	useEffect,
	useRef,
} from "react";
import { SfxControl } from "@/components/sfx";
import {
	ROUTES,
	WORLD_ORDER,
	WORLDS,
	type WorldId,
	worldOfPath,
} from "../_lib/content";
import { RadioChip } from "./radio";

export type Mode = "human" | "agent";

const PAGES = [
	{ href: ROUTES.about, label: "about" },
	{ href: ROUTES.contact, label: "contact" },
] as const;

/** px scrolled before the header tucks away on the way down */
const TUCK_AFTER = 180;
/** px of scroll that count as a change of direction */
const JITTER = 6;

interface SiteHeaderProps {
	mode: Mode;
	onFocusWorld?: (world: WorldId | null) => void;
	onMode: (mode: Mode) => void;
	/** the home's header waits for the entrance; pages stick to the top */
	variant?: "home" | "page";
	/** the rest of the header has faded in */
	visible?: boolean;
	/** the loader's name has landed; show the real one */
	wordmarkVisible?: boolean;
}

export function SiteHeader({
	mode,
	onFocusWorld,
	onMode,
	variant = "page",
	visible = true,
	wordmarkVisible = true,
}: SiteHeaderProps) {
	const pathname = usePathname();
	const headerRef = useRef<HTMLElement>(null);
	const here = worldOfPath(pathname);

	const clearFocus = useCallback(() => onFocusWorld?.(null), [onFocusWorld]);
	const focusWorld = useCallback(
		(event: FocusEvent<HTMLElement> | PointerEvent<HTMLElement>) =>
			onFocusWorld?.(event.currentTarget.dataset.world as WorldId),
		[onFocusWorld]
	);
	const pickMode = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) =>
			onMode(event.currentTarget.dataset.mode as Mode),
		[onMode]
	);

	/* on long pages the header tucks away while you read down, and comes
	   back the moment you scroll up or tab into it */
	useEffect(() => {
		const header = headerRef.current;
		if (!header || variant !== "page") {
			return;
		}
		let lastY = window.scrollY;
		let frame = 0;
		const update = () => {
			frame = 0;
			const y = window.scrollY;
			header.toggleAttribute("data-scrolled", y > 8);
			if (y <= TUCK_AFTER) {
				header.removeAttribute("data-tucked");
				lastY = y;
				return;
			}
			if (Math.abs(y - lastY) < JITTER) {
				return;
			}
			header.toggleAttribute(
				"data-tucked",
				y > lastY && !header.matches(":focus-within")
			);
			lastY = y;
		};
		const onScroll = () => {
			if (frame === 0) {
				frame = requestAnimationFrame(update);
			}
		};
		const onFocusIn = () => header.removeAttribute("data-tucked");
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		header.addEventListener("focusin", onFocusIn);
		return () => {
			window.removeEventListener("scroll", onScroll);
			header.removeEventListener("focusin", onFocusIn);
			cancelAnimationFrame(frame);
		};
	}, [variant]);

	return (
		<header
			className="site-header"
			data-mode={mode}
			data-variant={variant}
			data-visible={visible || undefined}
			data-wordmark-visible={wordmarkVisible || undefined}
			ref={headerRef}
		>
			<div className="site-left">
				<div className="wordmark-tools">
					<Link
						aria-current={pathname === ROUTES.home ? "page" : undefined}
						className="wordmark"
						href={ROUTES.home}
					>
						<span className="wordmark-name">
							<span className="wordmark-first" data-wordmark>
								ekaksh
							</span>
							<span className="wordmark-last"> janweja.</span>
						</span>
						<span className="wordmark-line">early-stage engineer.</span>
						<span className="sr-only">, back to the ring</span>
					</Link>
					<SfxControl />
				</div>
				<nav aria-label="worlds" className="world-nav">
					{WORLD_ORDER.map((id) => {
						const world = WORLDS[id];
						let current: "page" | "true" | undefined;
						if (pathname === world.href) {
							current = "page";
						} else if (here === id) {
							current = "true";
						}
						return (
							<span className="world-option" key={id}>
								<span aria-hidden className="slash">
									/
								</span>
								<Link
									aria-current={current}
									className="world-link"
									data-current={current ? "" : undefined}
									data-world={id}
									href={world.href}
									onBlur={clearFocus}
									onFocus={focusWorld}
									onPointerEnter={focusWorld}
									onPointerLeave={clearFocus}
									style={
										{
											"--on": world.on,
											"--world": world.color,
										} as React.CSSProperties
									}
								>
									{world.label}
								</Link>
							</span>
						);
					})}
				</nav>
			</div>
			<div className="site-right">
				<RadioChip />
				<nav aria-label="pages" className="page-nav">
					{PAGES.map((page) => (
						<Link
							aria-current={pathname === page.href ? "page" : undefined}
							className="page-link"
							href={page.href}
							key={page.href}
						>
							{page.label}
						</Link>
					))}
				</nav>
				{/* biome-ignore lint/a11y/useSemanticElements: a pair of toggle buttons, not a form fieldset */}
				<div
					aria-label="view this page as"
					className="mode-switch"
					data-mode={mode}
					role="group"
				>
					<button
						aria-pressed={mode === "human"}
						data-mode="human"
						onClick={pickMode}
						type="button"
					>
						human
					</button>
					<span aria-hidden className="slash">
						/
					</span>
					<button
						aria-pressed={mode === "agent"}
						data-mode="agent"
						onClick={pickMode}
						type="button"
					>
						agent
					</button>
				</div>
			</div>
		</header>
	);
}
