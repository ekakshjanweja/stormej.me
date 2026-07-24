"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type TrovePreviewProps = {
	children: React.ReactNode;
	title: string;
	/** Path to the flutter web build, e.g. /trove/demo/app-toast/index.html. */
	demo?: string;
	surface: string;
	className?: string;
};

/** Matches the work hover card: same width, same stage-then-caption shape. */
const CARD_WIDTH_PX = 280;
const STAGE_HEIGHT_PX = 128;
/** Popup menus need a little more vertical room so the preview doesn't clip. */
const STAGE_HEIGHT_BY_DEMO: Record<string, number> = {
	"app-popup": 152,
	"app-selectable-chip": 136,
	"app-text-field": 180,
};

function stageHeightForDemo(demo?: string) {
	if (!demo) {
		return STAGE_HEIGHT_PX;
	}
	const slug = demo.split("/").at(-2);
	return (slug && STAGE_HEIGHT_BY_DEMO[slug]) ?? STAGE_HEIGHT_PX;
}

/**
 * Hover card that runs the real flutter demo, so a glance at the list is a
 * glance at the component.
 *
 * The demo runs in `?preview=1`, a compact loop with the controls stripped out,
 * so the card shows the component rather than a shrunken copy of the playground
 * further down the page.
 *
 * The bundle is multiple megabytes, so nothing mounts until the card opens and
 * a hover has survived {@link OPEN_DELAY_MS}. Once a demo has been started in
 * this session its slug is remembered, and later hovers skip the delay because
 * the bundle is already in the http cache.
 */
const OPEN_DELAY_MS = 450;
const WARM_DELAY_MS = 120;

const warmed = new Set<string>();

export function TrovePreview({
	children,
	title,
	demo,
	surface,
	className,
}: TrovePreviewProps) {
	const [isOpen, setOpen] = React.useState(false);
	const [loaded, setLoaded] = React.useState(false);
	const { resolvedTheme } = useTheme();
	const theme = resolvedTheme === "dark" ? "dark" : "light";

	// Touch devices have no hover, and would pay the bundle for a card they
	// cannot see.
	const [canHover, setCanHover] = React.useState(false);
	React.useEffect(() => {
		setCanHover(
			window.matchMedia("(hover: hover) and (pointer: fine)").matches
		);
	}, []);

	if (!(demo && canHover)) {
		return <>{children}</>;
	}

	const stageHeightPx = stageHeightForDemo(demo);

	const onOpenChange = (open: boolean) => {
		setOpen(open);
		if (!open) {
			setLoaded(false);
			return;
		}
		if (!warmed.has(demo)) {
			warmed.add(demo);
			track("trove_demo_started", { demo: title, surface });
		}
	};

	return (
		<HoverCardPrimitive.Root
			closeDelay={120}
			onOpenChange={onOpenChange}
			openDelay={warmed.has(demo) ? WARM_DELAY_MS : OPEN_DELAY_MS}
		>
			<HoverCardPrimitive.Trigger asChild className={className}>
				{children}
			</HoverCardPrimitive.Trigger>

			<HoverCardPrimitive.Content
				align="start"
				className="z-50 w-max min-w-0 origin-[--radix-hover-card-content-transform-origin] p-0 outline-none"
				side="top"
				sideOffset={12}
			>
				<AnimatePresence>
					{isOpen && (
						<motion.div
							animate={{
								opacity: 1,
								scale: 1,
								transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
								y: 0,
							}}
							className="min-w-0 overflow-hidden"
							exit={{
								opacity: 0,
								scale: 0.97,
								transition: { duration: 0.1, ease: [0.4, 0, 1, 1] },
								y: 4,
							}}
							initial={{ opacity: 0, scale: 0.97, y: 4 }}
							style={{
								maxWidth: `min(${CARD_WIDTH_PX}px, calc(100vw - 1.5rem))`,
								width: `min(${CARD_WIDTH_PX}px, calc(100vw - 1.5rem))`,
							}}
						>
							<div className="flex min-w-0 flex-col overflow-hidden rounded-md border border-border bg-popover">
								<div
									className="relative overflow-hidden bg-background"
									style={{ height: stageHeightPx }}
								>
									<iframe
										className={cn(
											"pointer-events-none block h-full w-full border-0 transition-opacity duration-150 ease-out motion-reduce:transition-none",
											loaded ? "opacity-100" : "opacity-0"
										)}
										// Remount on theme change so the demo re-reads ?theme.
										key={theme}
										onLoad={() => setLoaded(true)}
										src={`${demo}?theme=${theme}&preview=1`}
										// The loop is decorative, and a card that swallows the
										// pointer would fight the hover holding it open.
										tabIndex={-1}
										title={`${title} preview`}
									/>
									{!loaded && (
										<div
											className="absolute inset-0 flex items-center justify-center"
											role="status"
										>
											<Loader2
												aria-hidden
												className="size-4 animate-spin text-muted-foreground"
											/>
										</div>
									)}
								</div>
								<div className="flex h-9 min-w-0 items-center justify-between gap-2 border-border/70 border-t px-3">
									<span
										className="meta-tag block min-w-0 truncate normal-case tracking-[0.08em]"
										title={title}
									>
										{title}
									</span>
									<span className="meta-tag ml-auto shrink-0 normal-case tracking-[0.08em]">
										live
									</span>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</HoverCardPrimitive.Content>
		</HoverCardPrimitive.Root>
	);
}
