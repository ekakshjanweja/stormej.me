"use client";

import { Loader2, Monitor, Smartphone } from "lucide-react";
import { useTheme } from "next-themes";
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Layout = "mobile" | "desktop";

/** Logical viewport sizes the flutter embed should reflow at. */
const DEVICE_FRAMES = {
	desktop: { height: 560, Icon: Monitor, label: "mac layout", width: 720 },
	// Shorter than a full phone/desktop chrome so the playground stage + controls
	// read as one composition instead of a lonely widget in empty canvas.
	mobile: { height: 620, Icon: Smartphone, label: "iphone layout", width: 390 },
} as const satisfies Record<
	Layout,
	{ width: number; height: number; label: string; Icon: typeof Smartphone }
>;

function layoutForViewport(): Layout {
	return window.matchMedia("(min-width: 768px)").matches ? "desktop" : "mobile";
}

function subscribeToViewportLayout(onStoreChange: () => void) {
	const mq = window.matchMedia("(min-width: 768px)");
	mq.addEventListener("change", onStoreChange);
	return () => mq.removeEventListener("change", onStoreChange);
}

/**
 * Embeds a Flutter web build of a trove entry.
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
				"inline-flex items-center justify-center px-2 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset",
				isActive
					? "bg-muted/60 text-foreground"
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
	const [manualLayout, setManualLayout] = useState<Layout | null>(null);
	const onIframeLoad = useCallback(() => setLoaded(true), []);
	const viewportLayout = useSyncExternalStore<Layout>(
		subscribeToViewportLayout,
		layoutForViewport,
		(): Layout => "mobile"
	);
	const layout: Layout = manualLayout ?? viewportLayout;
	const containerRef = useRef<HTMLDivElement>(null);
	const { resolvedTheme } = useTheme();
	const theme = resolvedTheme === "dark" ? "dark" : "light";
	const frame = DEVICE_FRAMES[layout];

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

	return (
		<div
			className={cn("not-prose my-4 flex w-full justify-center", className)}
			ref={containerRef}
		>
			<div
				className="w-full overflow-hidden rounded-md border border-border/40"
				style={{ maxWidth: frame.width }}
			>
				<div className="flex h-9 items-center gap-3 border-border/40 border-b px-3">
					<span className="meta-tag">live demo</span>
					<span className="hidden shrink-0 font-light text-[12px] text-muted-foreground sm:inline">
						{layout === "mobile" ? "iphone" : "mac"}
					</span>

					<div className="ml-auto inline-flex shrink-0 overflow-hidden rounded-md border border-border/60">
						{(Object.keys(DEVICE_FRAMES) as Layout[]).map((value) => (
							<LayoutButton
								isActive={layout === value}
								key={value}
								onSelect={setManualLayout}
								value={value}
							/>
						))}
					</div>
				</div>

				<div
					className="relative w-full bg-background"
					style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
				>
					{inView && (
						// biome-ignore lint/a11y/noNoninteractiveElementInteractions: onLoad is a lifecycle event, not a user interaction
						<iframe
							className={cn(
								"absolute inset-0 block h-full w-full border-0 bg-background transition-opacity duration-150 ease-out motion-reduce:transition-none",
								loaded ? "opacity-100" : "opacity-0"
							)}
							// Remount on theme change so the demo re-reads ?theme. Layout
							// changes only resize it, so flutter reflows without a reload.
							key={theme}
							onLoad={onIframeLoad}
							src={`${src}?theme=${theme}`}
							title={`${name} interactive demo`}
						/>
					)}

					{!loaded && (
						<div
							className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center"
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
				</div>
			</div>
		</div>
	);
}
