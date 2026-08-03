"use client";

import { Loader2, Monitor, Smartphone } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	IPHONE_17_PRO_SCREEN,
	IPHONE_17_PRO_VIEWBOX,
	Iphone17Pro,
} from "@/components/ui/iphone-17-pro";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Layout = "mobile" | "desktop";

/**
 * Logical viewports the flutter embed should reflow at.
 *
 * Mobile uses iPhone 17 / 17 Pro points (402×874). The visible chrome is the
 * shared {@link Iphone17Pro} hardware bezel; the iframe fills the screen rect
 * inside that mock (no Dynamic Island).
 */
const DEVICE_FRAMES = {
	desktop: {
		height: 480,
		Icon: Monitor,
		label: "desktop layout",
		width: 760,
	},
	mobile: {
		height: 874,
		Icon: Smartphone,
		label: "phone layout",
		width: 402,
	},
} as const satisfies Record<
	Layout,
	{
		width: number;
		height: number;
		label: string;
		Icon: typeof Smartphone;
	}
>;

/**
 * Screen slot inside the 200×400 device viewBox.
 *
 * A tiny bleed tucks the live layer under the bezel lip so corner radii and
 * edges don't flash a hairline gap against the mock.
 *
 * Radius uses width%/height% (not cqw on the same node — that falls back to
 * the viewport and blows the corners into a pill).
 */
const SCREEN_BLEED = 1.15;
const SCREEN_RX = IPHONE_17_PRO_SCREEN.rx + SCREEN_BLEED;

const PHONE_CHROME = {
	homeBottom: `${(8 / 874) * 100}%`,
	homeHeight: `${(5 / 874) * 100}%`,
	homeWidth: `${(140 / 402) * 100}%`,
	screenHeight: `${((IPHONE_17_PRO_SCREEN.height + SCREEN_BLEED * 2) / IPHONE_17_PRO_VIEWBOX.height) * 100}%`,
	screenLeft: `${((IPHONE_17_PRO_SCREEN.x - SCREEN_BLEED) / IPHONE_17_PRO_VIEWBOX.width) * 100}%`,
	screenRadius: `${(SCREEN_RX / (IPHONE_17_PRO_SCREEN.width + SCREEN_BLEED * 2)) * 100}% / ${(SCREEN_RX / (IPHONE_17_PRO_SCREEN.height + SCREEN_BLEED * 2)) * 100}%`,
	screenTop: `${((IPHONE_17_PRO_SCREEN.y - SCREEN_BLEED) / IPHONE_17_PRO_VIEWBOX.height) * 100}%`,
	screenWidth: `${((IPHONE_17_PRO_SCREEN.width + SCREEN_BLEED * 2) / IPHONE_17_PRO_VIEWBOX.width) * 100}%`,
	/** Slim status bar — just enough for time + system icons. */
	statusHeight: `${(34 / 874) * 100}%`,
	statusPadX: `${(28 / 402) * 100}%`,
} as const;

/**
 * Leaves room for the site nav, the demo toolbar, and vertical margins so the
 * desktop stage never forces the page taller than one screen.
 */
const STAGE_MAX_HEIGHT = "calc(100svh - 9rem)";

/** Phone mock targets most of the viewport height; width follows aspect ratio. */
const PHONE_MAX_HEIGHT = "90svh";

/**
 * Embeds a Flutter web build of a trove entry.
 *
 * Defaults to the phone frame. Desktop is opt-in so the first read always
 * matches how these components ship in the app.
 *
 * The iframe mounts once the block scrolls near the viewport, so a reader who
 * never reaches it never pays for the bundle, and one who does gets it running
 * without having to ask.
 */
function LayoutButton({
	isActive,
	onSelect,
	value,
}: {
	isActive: boolean;
	onSelect: (value: Layout) => void;
	value: Layout;
}) {
	const { label, Icon } = DEVICE_FRAMES[value];
	const onClick = useCallback(() => onSelect(value), [onSelect, value]);

	return (
		<button
			aria-label={label}
			aria-pressed={isActive}
			className={cn(
				"inline-flex items-center justify-center px-2.5 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset",
				isActive
					? "bg-muted/70 text-foreground"
					: "text-muted-foreground hover:text-foreground"
			)}
			onClick={onClick}
			title={label}
			type="button"
		>
			<Icon aria-hidden className="size-3.5" />
		</button>
	);
}

export function FlutterDemo({
	src,
	name,
	className,
}: {
	src: string;
	name: string;
	className?: string;
}) {
	const [inView, setInView] = useState(false);
	const [loaded, setLoaded] = useState(false);
	// Phone on small viewports; desktop playground on wide ones. Toggle still wins.
	const [layout, setLayout] = useState<Layout>("mobile");
	const onIframeLoad = useCallback(() => setLoaded(true), []);
	const onSelectLayout = useCallback(
		(next: Layout) => {
			if (next === layout) {
				return;
			}
			setLoaded(false);
			setLayout(next);
		},
		[layout]
	);
	const containerRef = useRef<HTMLDivElement>(null);
	const screenRef = useRef<HTMLDivElement>(null);
	const [phoneScale, setPhoneScale] = useState(1);
	const { resolvedTheme } = useTheme();
	const theme = resolvedTheme === "dark" ? "dark" : "light";
	const frame = DEVICE_FRAMES[layout];
	const isPhone = layout === "mobile";

	useEffect(() => {
		const next = window.matchMedia("(min-width: 768px)").matches
			? "desktop"
			: "mobile";
		setLayout(next);
		if (next === "desktop") {
			setLoaded(false);
		}
	}, []);

	useEffect(() => {
		const node = containerRef.current;
		if (!node) {
			return;
		}

		// Older browsers just get the demo immediately rather than never.
		if (typeof IntersectionObserver === "undefined") {
			setInView(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) {
					return;
				}
				setInView(true);
				track("trove_demo_started", { demo: name });
				observer.disconnect();
			},
			// Start fetching just before it scrolls in so it is usually ready on
			// arrival.
			{ rootMargin: "300px 0px" }
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [name]);

	// Fit a true mobile logical viewport (402pt) into the screen hole so chrome
	// reads at phone density, not blown up to the mock's CSS pixel width.
	useEffect(() => {
		if (!isPhone) {
			return;
		}

		const node = screenRef.current;
		if (!node || typeof ResizeObserver === "undefined") {
			return;
		}

		const update = ([entry]: ResizeObserverEntry[]) => {
			const { width } = entry.contentRect;
			if (width <= 0) {
				return;
			}
			setPhoneScale(width / DEVICE_FRAMES.mobile.width);
		};

		const observer = new ResizeObserver(update);
		observer.observe(node);
		return () => observer.disconnect();
	}, [isPhone]);

	// Phone grows with viewport height (~90svh); desktop keeps the wide playground.
	const stageMaxWidth = isPhone
		? `min(100%, calc(${PHONE_MAX_HEIGHT} * ${IPHONE_17_PRO_VIEWBOX.width} / ${IPHONE_17_PRO_VIEWBOX.height}))`
		: `min(100%, ${frame.width}px, calc(${STAGE_MAX_HEIGHT} * ${frame.width} / ${frame.height}))`;

	return (
		<div
			className={cn(
				"not-prose relative my-6 flex w-full justify-center",
				className
			)}
			ref={containerRef}
		>
			{isPhone && (
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-[-1rem] top-8 bottom-0 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_50%_40%,color-mix(in_oklab,var(--muted)_55%,transparent),transparent_70%)] sm:inset-x-[-2rem]"
				/>
			)}

			<div
				className="flex w-full flex-col gap-3"
				style={{ maxWidth: stageMaxWidth }}
			>
				<div className="flex h-9 items-center gap-3 rounded-xl border border-border/50 bg-background/60 px-3 backdrop-blur-sm">
					<span className="meta-tag">live demo</span>

					<div className="ml-auto inline-flex shrink-0 overflow-hidden rounded-lg border border-border/60 bg-background/40">
						{(Object.keys(DEVICE_FRAMES) as Layout[]).map((value) => (
							<LayoutButton
								isActive={layout === value}
								key={value}
								onSelect={onSelectLayout}
								value={value}
							/>
						))}
					</div>
				</div>

				{isPhone ? (
					<div
						className="relative w-full"
						style={{
							aspectRatio: `${IPHONE_17_PRO_VIEWBOX.width} / ${IPHONE_17_PRO_VIEWBOX.height}`,
							filter:
								"drop-shadow(0 1px 0 color-mix(in oklab, var(--foreground) 14%, transparent)) drop-shadow(0 28px 50px color-mix(in oklab, var(--foreground) 22%, transparent))",
							maxHeight: PHONE_MAX_HEIGHT,
						}}
					>
						{/* Live screen tucked under the bezel; no Dynamic Island. */}
						<div
							className="absolute overflow-hidden bg-background [container-type:size]"
							ref={screenRef}
							style={{
								borderRadius: PHONE_CHROME.screenRadius,
								height: PHONE_CHROME.screenHeight,
								left: PHONE_CHROME.screenLeft,
								top: PHONE_CHROME.screenTop,
								width: PHONE_CHROME.screenWidth,
							}}
						>
							{/*
							  Flutter lays out at real iPhone points, then we scale that
							  canvas into the (smaller) screen hole — mobile density, not
							  desktop-sized chrome crammed into a phone bezel.
							*/}
							<div
								className="origin-top-left"
								style={{
									height: DEVICE_FRAMES.mobile.height,
									transform: `scale(${phoneScale})`,
									width: DEVICE_FRAMES.mobile.width,
								}}
							>
								<DemoStage
									fill
									inView={inView}
									layout={layout}
									loaded={loaded}
									name={name}
									onIframeLoad={onIframeLoad}
									src={src}
									theme={theme}
								/>
							</div>

							{/* Status bar — time + cellular / wifi / battery. */}
							<div
								aria-hidden
								className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between text-foreground"
								style={{
									height: PHONE_CHROME.statusHeight,
									paddingLeft: PHONE_CHROME.statusPadX,
									paddingRight: PHONE_CHROME.statusPadX,
								}}
							>
								<span className="font-semibold text-[clamp(9px,3.2cqw,13px)] tabular-nums leading-none tracking-tight">
									9:41
								</span>
								<div className="flex items-center gap-[0.35em] text-[clamp(9px,3.2cqw,13px)]">
									<StatusSignalIcon className="h-[0.85em] w-[1.15em]" />
									<StatusWifiIcon className="h-[0.85em] w-[1.05em]" />
									<StatusBatteryIcon className="h-[0.75em] w-[1.45em]" />
								</div>
							</div>

							{/* Home indicator */}
							<div
								aria-hidden
								className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-foreground/35"
								style={{
									bottom: PHONE_CHROME.homeBottom,
									height: PHONE_CHROME.homeHeight,
									width: PHONE_CHROME.homeWidth,
								}}
							/>
						</div>

						<Iphone17Pro
							aria-hidden
							className="pointer-events-none absolute inset-0 h-full w-full max-w-none"
							showIsland={false}
							showScreen={false}
						/>
					</div>
				) : (
					<div
						className="relative w-full overflow-hidden rounded-xl border border-border/40 bg-background shadow-[0_18px_50px_-28px_color-mix(in_oklab,var(--foreground)_22%,transparent)]"
						style={{
							aspectRatio: `${frame.width} / ${frame.height}`,
							maxHeight: STAGE_MAX_HEIGHT,
						}}
					>
						<DemoStage
							inView={inView}
							layout={layout}
							loaded={loaded}
							name={name}
							onIframeLoad={onIframeLoad}
							src={src}
							theme={theme}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

function StatusSignalIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden
			className={cn("fill-current", className)}
			focusable="false"
			viewBox="0 0 17 12"
		>
			<title>Cellular signal</title>
			<rect height="3.2" rx="0.6" width="2.4" x="0" y="8.4" />
			<rect height="5.2" rx="0.6" width="2.4" x="4.4" y="6.4" />
			<rect height="7.6" rx="0.6" width="2.4" x="8.8" y="4" />
			<rect height="11.2" rx="0.6" width="2.4" x="13.2" y="0.4" />
		</svg>
	);
}

function StatusWifiIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden
			className={cn("fill-none stroke-current", className)}
			focusable="false"
			strokeLinecap="round"
			strokeWidth="1.6"
			viewBox="0 0 16 12"
		>
			<title>Wi-Fi</title>
			<path d="M1.2 4.2c3.7-3.4 9.9-3.4 13.6 0" />
			<path d="M3.6 6.6c2.4-2.2 6.4-2.2 8.8 0" />
			<path d="M6 9c1.1-1 2.9-1 4 0" />
			<circle className="fill-current stroke-none" cx="8" cy="11" r="1" />
		</svg>
	);
}

function StatusBatteryIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden
			className={cn("fill-none stroke-current", className)}
			focusable="false"
			strokeWidth="1.2"
			viewBox="0 0 25 12"
		>
			<title>Battery</title>
			<rect height="10" rx="2.2" width="21" x="0.6" y="1" />
			<path d="M23.2 4v4" strokeLinecap="round" strokeWidth="1.6" />
			<rect
				className="fill-current stroke-none"
				height="7"
				rx="1.2"
				width="16"
				x="2.2"
				y="2.5"
			/>
		</svg>
	);
}

function DemoStage({
	fill = false,
	inView,
	layout,
	loaded,
	name,
	onIframeLoad,
	src,
	theme,
}: {
	/** Fill a sized parent (scaled phone canvas) instead of absolute-inset. */
	fill?: boolean;
	inView: boolean;
	layout: Layout;
	loaded: boolean;
	name: string;
	onIframeLoad: () => void;
	src: string;
	theme: string;
}) {
	const frameClass = fill
		? "relative block h-full w-full"
		: "absolute inset-0 z-0 block h-full w-full";

	return (
		<>
			{inView && (
				// biome-ignore lint/a11y/noNoninteractiveElementInteractions: onLoad is a lifecycle event, not a user interaction
				<iframe
					className={cn(
						frameClass,
						"border-0 bg-background transition-opacity duration-200 ease-out motion-reduce:transition-none",
						loaded ? "opacity-100" : "opacity-0"
					)}
					// Remount on theme/layout so the demo re-reads query params.
					key={`${theme}-${layout}`}
					onLoad={onIframeLoad}
					src={`${src}?theme=${theme}&layout=${layout}`}
					title={`${name} interactive demo`}
				/>
			)}

			{!loaded && (
				<div
					className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background text-center"
					role="status"
				>
					<Loader2
						aria-hidden
						className="size-4 animate-spin text-muted-foreground"
					/>
					<p className="font-light text-[12px] text-muted-foreground">
						starting the demo
					</p>
				</div>
			)}
		</>
	);
}
