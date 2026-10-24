"use client";

import { ArrowLeft, ArrowRight, ChevronUp, RotateCcw } from "lucide-react";
import {
	type MouseEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { GROUP_LABELS, LOADERS, type LoaderGroup } from "./loaders";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const GROUPS: LoaderGroup[] = ["home", "wild"];

const pill =
	"inline-flex h-8 items-center justify-center gap-1.5 rounded-full transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transition-none";

function slugIndex(slug: string | null) {
	const i = LOADERS.findIndex((loader) => loader.slug === slug);
	return i === -1 ? 0 : i;
}

function IconButton({
	children,
	label,
	onClick,
}: {
	children: ReactNode;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			aria-label={label}
			className={cn(
				pill,
				"w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
			)}
			onClick={onClick}
			title={label}
			type="button"
		>
			{children}
		</button>
	);
}

/**
 * Plays one loader at a time over the real home page, with a small dock to
 * step through them, replay, or pick one from the list. ←/→ step, esc skips.
 * The choice lives in ?l= so a loader can be linked to directly.
 */
export function LoaderLab() {
	const [mounted, setMounted] = useState(false);
	const [index, setIndex] = useState(0);
	const [run, setRun] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [reduced, setReduced] = useState(false);
	const dock = useRef<HTMLDivElement>(null);

	const play = useCallback((next: number) => {
		const i = (next + LOADERS.length) % LOADERS.length;
		window.scrollTo({ behavior: "instant", top: 0 });
		setIndex(i);
		setRun((r) => r + 1);
		setPlaying(true);
		setMenuOpen(false);
		const url = new URL(window.location.href);
		url.searchParams.set("l", LOADERS[i]?.slug ?? "");
		window.history.replaceState(null, "", url);
	}, []);

	const finish = useCallback(() => setPlaying(false), []);
	const stepBack = useCallback(() => play(index - 1), [index, play]);
	const stepForward = useCallback(() => play(index + 1), [index, play]);
	const replay = useCallback(() => play(index), [index, play]);
	const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
	/* the menu's rows carry their index, so one handler serves them all */
	const pick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) =>
			play(Number(event.currentTarget.dataset.index)),
		[play]
	);

	useEffect(() => {
		const slug = new URLSearchParams(window.location.search).get("l");
		const reduce = window.matchMedia(REDUCED_MOTION).matches;
		setReduced(reduce);
		setMounted(true);
		if (reduce) {
			setIndex(slugIndex(slug));
			return;
		}
		play(slugIndex(slug));
	}, [play]);

	/* the page holds still under a loader; the gutter stays so nothing shifts */
	useEffect(() => {
		if (!playing) {
			return;
		}
		const html = document.documentElement;
		const { overflow, scrollbarGutter } = html.style;
		html.style.overflow = "hidden";
		html.style.scrollbarGutter = "stable";
		return () => {
			html.style.overflow = overflow;
			html.style.scrollbarGutter = scrollbarGutter;
		};
	}, [playing]);

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
				return;
			}
			if (event.key === "Escape") {
				if (playing) {
					finish();
				}
				setMenuOpen(false);
			} else if (event.key === "ArrowRight") {
				play(index + 1);
			} else if (event.key === "ArrowLeft") {
				play(index - 1);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [finish, index, play, playing]);

	useEffect(() => {
		if (!menuOpen) {
			return;
		}
		const onPointerDown = (event: PointerEvent) => {
			if (!dock.current?.contains(event.target as Node)) {
				setMenuOpen(false);
			}
		};
		window.addEventListener("pointerdown", onPointerDown);
		return () => window.removeEventListener("pointerdown", onPointerDown);
	}, [menuOpen]);

	/* before hydration a plain cover holds the page back, so the first loader
	   doesn't open on a flash of the finished page */
	if (!mounted) {
		return (
			<>
				<style>{".site-nav{visibility:hidden}"}</style>
				<div className="fixed inset-0 z-[200] bg-background" />
			</>
		);
	}

	const current = LOADERS[index];
	if (!current) {
		return null;
	}
	const { Component } = current;
	const counter = `${String(index + 1).padStart(2, "0")}/${String(LOADERS.length).padStart(2, "0")}`;

	return createPortal(
		<>
			{playing ? <Component key={run} onDone={finish} /> : null}

			{playing ? (
				<button
					className="fixed right-4 bottom-4 z-[210] font-mono text-[11px] text-white uppercase tracking-[0.16em] opacity-60 mix-blend-difference transition-opacity hover:opacity-100"
					onClick={finish}
					type="button"
				>
					skip · esc
				</button>
			) : null}

			<div
				className={cn(
					"pointer-events-none fixed inset-x-0 bottom-5 z-[150] flex justify-center px-4 transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none",
					playing && "translate-y-3 opacity-0"
				)}
			>
				<div
					className={cn("relative", !playing && "pointer-events-auto")}
					ref={dock}
				>
					{menuOpen ? (
						<div className="absolute right-0 bottom-full left-0 mb-2 min-w-[min(92vw,22rem)] rounded-2xl border border-border bg-background/95 p-1.5 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.35)] backdrop-blur-md sm:left-1/2 sm:-translate-x-1/2">
							{GROUPS.map((group) => (
								<div className="py-1" key={group}>
									<p className="meta-tag px-2.5 pt-1 pb-1.5">
										{GROUP_LABELS[group]}
									</p>
									<ul>
										{LOADERS.map((loader, i) =>
											loader.group === group ? (
												<li key={loader.slug}>
													<button
														aria-current={i === index ? "true" : undefined}
														className={cn(
															"flex w-full items-baseline gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted",
															i === index && "bg-muted"
														)}
														data-index={i}
														onClick={pick}
														type="button"
													>
														<span className="w-5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
															{String(i + 1).padStart(2, "0")}
														</span>
														<span className="min-w-0">
															<span className="block text-[13px] text-foreground">
																{loader.name}
															</span>
															<span className="block text-[12px] text-muted-foreground">
																{loader.blurb}
															</span>
														</span>
													</button>
												</li>
											) : null
										)}
									</ul>
								</div>
							))}
						</div>
					) : null}

					<div
						aria-label="loader experiments"
						className="flex items-center gap-0.5 rounded-full border border-border bg-background/85 p-1 text-[13px] shadow-[0_10px_30px_-14px_rgba(0,0,0,0.3)] backdrop-blur-md"
						role="toolbar"
					>
						<IconButton label="previous loader" onClick={stepBack}>
							<ArrowLeft aria-hidden className="size-4" />
						</IconButton>
						<button
							aria-expanded={menuOpen}
							aria-haspopup="true"
							className={cn(pill, "gap-2 px-3 hover:bg-muted")}
							onClick={toggleMenu}
							type="button"
						>
							<span className="font-mono text-[11px] text-muted-foreground tabular-nums">
								{counter}
							</span>
							<span className="text-foreground">{current.name}</span>
							<ChevronUp
								aria-hidden
								className={cn(
									"size-3.5 text-muted-foreground transition-transform duration-200",
									!menuOpen && "rotate-180"
								)}
							/>
						</button>
						<IconButton label="next loader" onClick={stepForward}>
							<ArrowRight aria-hidden className="size-4" />
						</IconButton>
						<button
							className={cn(
								pill,
								"ml-1 bg-foreground px-3.5 font-medium text-background hover:bg-foreground/85"
							)}
							onClick={replay}
							type="button"
						>
							<RotateCcw aria-hidden className="size-3.5" />
							{reduced ? "play anyway" : "replay"}
						</button>
					</div>
				</div>
			</div>
		</>,
		document.body
	);
}
