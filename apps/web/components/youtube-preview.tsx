"use client";

// biome-ignore lint/performance/noNamespaceImport: shadcn ships these primitives namespaced; keeping it aligned with upstream
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { videoThumbnailUrl } from "@/lib/videos";

interface YoutubePreviewProps {
	children: ReactNode;
	className?: string;
	title: string;
	videoId: string;
}

const CARD_WIDTH_PX = 280;
const STAGE_HEIGHT_PX = Math.round((CARD_WIDTH_PX * 9) / 16);
const OPEN_DELAY_MS = 120;
const CLOSE_DELAY_MS = 100;
/** Quick stills; one full pass of the four frames is ~2s, looping for the hover. */
const FRAME_INTERVAL_MS = 500;

function previewFrames(videoId: string): string[] {
	return [
		videoThumbnailUrl(videoId),
		`https://i.ytimg.com/vi/${videoId}/1.jpg`,
		`https://i.ytimg.com/vi/${videoId}/2.jpg`,
		`https://i.ytimg.com/vi/${videoId}/3.jpg`,
	];
}

/**
 * Hover card for YouTube links: a looping flipbook of YouTube storyboard
 * stills (no embed). Touch and reduced-motion stay on the poster frame.
 */
export function YoutubePreview({
	children,
	className,
	title,
	videoId,
}: YoutubePreviewProps) {
	const [isOpen, setOpen] = useState(false);
	const [frameIndex, setFrameIndex] = useState(0);
	const [canHover, setCanHover] = useState(false);
	const [reduceMotion, setReduceMotion] = useState(false);

	const frames = useMemo(() => previewFrames(videoId), [videoId]);
	const poster = frames[0] ?? videoThumbnailUrl(videoId);

	useEffect(() => {
		setCanHover(
			window.matchMedia("(hover: hover) and (pointer: fine)").matches
		);
		setReduceMotion(
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		);
	}, []);

	useEffect(() => {
		if (!canHover) {
			return;
		}
		if (
			!document.querySelector(
				'link[rel="preconnect"][href="https://i.ytimg.com"]'
			)
		) {
			const link = document.createElement("link");
			link.rel = "preconnect";
			link.href = "https://i.ytimg.com";
			document.head.appendChild(link);
		}
		for (const src of frames) {
			const img = new window.Image();
			img.src = src;
		}
	}, [canHover, frames]);

	useEffect(() => {
		if (!(isOpen && !reduceMotion)) {
			return;
		}
		const id = window.setInterval(() => {
			setFrameIndex((i) => (i + 1) % frames.length);
		}, FRAME_INTERVAL_MS);
		return () => window.clearInterval(id);
	}, [frames.length, isOpen, reduceMotion]);

	const onOpenChange = useCallback((nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			setFrameIndex(0);
		}
	}, []);

	if (!canHover) {
		return <>{children}</>;
	}

	const stillSrc =
		isOpen && !reduceMotion ? (frames[frameIndex] ?? poster) : poster;

	return (
		<HoverCardPrimitive.Root
			closeDelay={CLOSE_DELAY_MS}
			onOpenChange={onOpenChange}
			openDelay={OPEN_DELAY_MS}
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
								transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
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
									style={{ height: STAGE_HEIGHT_PX }}
								>
									<Image
										alt=""
										className="absolute inset-0 h-full w-full object-cover"
										height={STAGE_HEIGHT_PX}
										src={stillSrc}
										unoptimized
										width={CARD_WIDTH_PX}
									/>
								</div>
								<div className="flex h-9 min-w-0 items-center justify-between gap-2 border-border/70 border-t px-3">
									<span
										className="meta-tag block min-w-0 truncate normal-case tracking-[0.08em]"
										title={title}
									>
										{title}
									</span>
									<span className="meta-tag ml-auto shrink-0 normal-case tracking-[0.08em]">
										preview
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
