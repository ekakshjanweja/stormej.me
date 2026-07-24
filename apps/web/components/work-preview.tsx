"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Iphone17Pro } from "@/components/ui/iphone-17-pro";
import type {
	ScreenshotMockupKind,
	WorkImageAsset,
	WorkLogoAsset,
} from "@/lib/types/types";
import { cn } from "@/lib/utils";
import { isPairedScreenshots, isVideoAsset } from "@/lib/work-image";

interface WorkPreviewProps {
	children: ReactNode;
	className?: string;
	href: string;
	images?: WorkImageAsset[];
	logo?: WorkLogoAsset;
	screenshotMockup?: ScreenshotMockupKind;
	title: string;
}

const PLACEHOLDER_GRADIENTS = [
	"from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800",
	"from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800",
	"from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800",
];

/** Exact width: 3×PhoneFrame + 2×gap-2 + 2×px-3 on the strip (gap-2 = 0.5rem, px-3 = 0.75rem @ 16px root). */
const PREVIEW_CARD_WIDTH_PX = {
	default: 280, // 240 + 16 + 24
	"iphone-17-pro": 292, // 252 + 16 + 24
} as const;

function previewCardWidthPx(mockup?: ScreenshotMockupKind) {
	return mockup === "iphone-17-pro"
		? PREVIEW_CARD_WIDTH_PX["iphone-17-pro"]
		: PREVIEW_CARD_WIDTH_PX.default;
}

/** Capped at phone-strip width so long titles cannot widen the hover card (flex min-width:auto). */
function previewCardShellStyle(px: number): CSSProperties {
	return {
		maxWidth: `min(${px}px, calc(100vw - 1.5rem))`,
		minWidth: 0,
		width: `min(${px}px, calc(100vw - 1.5rem))`,
	};
}

export function WorkPreview({
	children,
	title,
	href,
	logo,
	images,
	screenshotMockup,
	className,
}: WorkPreviewProps) {
	const [isOpen, setOpen] = useState(false);
	const slots =
		images && images.length > 0 ? images.slice(0, 3) : [null, null, null];
	const cardPx = previewCardWidthPx(screenshotMockup);
	const cardShellStyle = previewCardShellStyle(cardPx);

	return (
		<HoverCardPrimitive.Root
			closeDelay={120}
			onOpenChange={setOpen}
			openDelay={150}
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
							style={cardShellStyle}
						>
							<Link
								className={cn(
									"box-border flex min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border bg-popover transition-colors duration-150 hover:border-foreground/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
								)}
								href={href}
								style={cardShellStyle}
							>
								<div className="flex w-full items-end justify-center gap-2 px-3 pt-3 pb-2">
									{slots.map((src, i) => (
										<PhoneFrame
											delay={i}
											gradient={
												PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length]
											}
											key={i}
											logo={logo}
											screenshotMockup={screenshotMockup}
											src={src}
											title={title}
										/>
									))}
								</div>
								<div className="min-w-0 overflow-hidden border-border/70 border-t px-3 py-1.5">
									<span
										className="meta-tag block min-w-0 truncate normal-case tracking-[0.08em]"
										title={title}
									>
										{title}
									</span>
								</div>
							</Link>
						</motion.div>
					)}
				</AnimatePresence>
			</HoverCardPrimitive.Content>
		</HoverCardPrimitive.Root>
	);
}

function PhoneFrame({
	src,
	logo,
	title,
	screenshotMockup,
	gradient,
	delay,
}: {
	src: WorkImageAsset | null;
	logo?: WorkLogoAsset;
	title: string;
	screenshotMockup?: ScreenshotMockupKind;
	gradient: string;
	delay: number;
}) {
	const useIphone17 =
		Boolean(src) &&
		screenshotMockup === "iphone-17-pro" &&
		!(typeof src === "string" && isVideoAsset(src));

	return (
		<motion.div
			animate={{
				opacity: 1,
				transition: {
					delay: 0.05 + delay * 0.05,
					duration: 0.25,
					ease: [0.16, 1, 0.3, 1],
				},
				y: 0,
			}}
			className={cn(
				"relative flex shrink-0 items-center justify-center",
				useIphone17
					? "h-[158px] w-[84px] overflow-visible px-px"
					: "h-[160px] w-[80px] overflow-hidden rounded-[10px] border border-border/80 bg-background shadow-sm"
			)}
			initial={{ opacity: 0, y: 6 }}
		>
			{src ? (
				typeof src === "string" && isVideoAsset(src) ? (
					<video
						autoPlay
						className="absolute inset-0 h-full w-full object-cover"
						loop
						muted
						playsInline
						preload="metadata"
						src={src}
					/>
				) : useIphone17 ? (
					isPairedScreenshots(src) ? (
						<>
							<Iphone17Pro
								className="dark:hidden"
								height={148}
								src={src.light}
								width={74}
							/>
							<Iphone17Pro
								className="hidden dark:block"
								height={148}
								src={src.dark}
								width={74}
							/>
						</>
					) : typeof src === "string" ? (
						<Iphone17Pro height={148} src={src} width={74} />
					) : null
				) : isPairedScreenshots(src) ? (
					<>
						<Image
							alt={`${title} screenshot (light)`}
							className="object-cover dark:hidden"
							fill
							sizes="80px"
							src={src.light}
						/>
						<Image
							alt={`${title} screenshot (dark)`}
							className="hidden object-cover dark:block"
							fill
							sizes="80px"
							src={src.dark}
						/>
					</>
				) : (
					<Image
						alt={`${title} screenshot`}
						className="object-cover"
						fill
						sizes="80px"
						src={src}
					/>
				)
			) : (
				<div className={cn("absolute inset-0 bg-gradient-to-br", gradient)}>
					<div className="absolute top-2 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-foreground/20" />
					{logo && (
						<span className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 opacity-50">
							{isPairedScreenshots(logo) ? (
								<>
									<Image
										alt=""
										className="object-contain dark:hidden"
										fill
										sizes="24px"
										src={logo.light}
									/>
									<Image
										alt=""
										className="hidden object-contain dark:block"
										fill
										sizes="24px"
										src={logo.dark}
									/>
								</>
							) : (
								<Image
									alt=""
									className="object-contain"
									fill
									sizes="24px"
									src={logo}
								/>
							)}
						</span>
					)}
				</div>
			)}
		</motion.div>
	);
}
