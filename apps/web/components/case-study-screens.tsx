"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Iphone17Pro } from "@/components/ui/iphone-17-pro";
import type { ScreenshotMockupKind, WorkImageAsset } from "@/lib/types/types";
import { cn } from "@/lib/utils";
import {
	isPairedScreenshots,
	isVideoAsset,
	workImageStableKey,
} from "@/lib/work-image";

function ThemedScreenshot({
	asset,
	alt,
	priority,
	sizes,
	className,
	fit,
}: {
	asset: WorkImageAsset;
	alt: string;
	priority?: boolean;
	sizes: string;
	className?: string;
	fit: "cover" | "contain";
}) {
	const fitClass = fit === "cover" ? "object-cover" : "object-contain";
	if (isPairedScreenshots(asset)) {
		return (
			<>
				<Image
					alt={`${alt} (light)`}
					className={cn(fitClass, "dark:hidden", className)}
					fill
					priority={priority}
					sizes={sizes}
					src={asset.light}
				/>
				<Image
					alt={`${alt} (dark)`}
					className={cn(fitClass, "hidden dark:block", className)}
					fill
					priority={priority}
					sizes={sizes}
					src={asset.dark}
				/>
			</>
		);
	}
	return (
		<Image
			alt={alt}
			className={cn(fitClass, className)}
			fill
			priority={priority}
			sizes={sizes}
			src={asset}
		/>
	);
}

function IphoneMockupScreens({
	asset,
	className,
}: {
	asset: WorkImageAsset;
	className?: string;
}) {
	const commonCn = cn("mx-auto w-full max-w-[min(100%,228px)]", className);

	if (isPairedScreenshots(asset)) {
		return (
			<div className={commonCn}>
				<Iphone17Pro aria-hidden className="dark:hidden" src={asset.light} />
				<Iphone17Pro
					aria-hidden
					className="hidden dark:block"
					src={asset.dark}
				/>
			</div>
		);
	}
	return <Iphone17Pro aria-hidden className={commonCn} src={asset} />;
}

function galleryLayoutClass(count: number) {
	if (count <= 1) {
		return "mx-auto grid max-w-[260px] grid-cols-1 justify-items-stretch";
	}
	const mobileScroll =
		"-mx-2 flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
	if (count === 2) {
		return cn(
			mobileScroll,
			"md:mx-auto md:grid md:max-w-xl md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
		);
	}
	return cn(
		mobileScroll,
		"md:mx-auto md:grid md:max-w-5xl md:grid-cols-3 md:items-end md:gap-7 md:overflow-visible md:px-0 md:pb-0"
	);
}

export function CaseStudyScreens({
	images,
	title,
	screenshotMockup,
	sectionId = "screenshots",
	appendix,
}: {
	images: WorkImageAsset[];
	title: string;
	screenshotMockup?: ScreenshotMockupKind;
	/** Anchor id for in-page links (sticky nav, etc.). */
	sectionId?: string;
	/** After main copy: top rule, spacing, tighter vertical rhythm for an “appendix” gallery. */
	appendix?: boolean;
}) {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const count = images.length;
	const openAsset = openIndex === null ? undefined : images[openIndex];

	const closeLightbox = useCallback(() => setOpenIndex(null), []);
	const showNext = useCallback(
		() =>
			setOpenIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : i)),
		[images.length]
	);
	const showPrev = useCallback(
		() => setOpenIndex((i) => (i !== null && i > 0 ? i - 1 : i)),
		[]
	);

	useEffect(() => {
		if (openIndex === null) {
			return;
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpenIndex(null);
			}
			if (e.key === "ArrowLeft") {
				setOpenIndex((i) => (i !== null && i > 0 ? i - 1 : i));
			}
			if (e.key === "ArrowRight") {
				setOpenIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : i));
			}
		};
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [openIndex, images.length]);

	return (
		<>
			<section
				aria-label="Screenshots"
				className={cn(
					"scroll-mt-32",
					appendix
						? "mt-14 space-y-5 border-border/55 border-t pt-12 pb-2"
						: "mb-12 space-y-4"
				)}
				id={sectionId}
			>
				<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
					<span className="meta-tag">
						{appendix ? "gallery" : "screenshots"}
					</span>
					{appendix && (
						<span className="font-light text-[12px] text-muted-foreground tracking-wide">
							open any screen to enlarge · {images.length} shots
						</span>
					)}
				</div>
				<div
					className={cn(
						"rounded-2xl border border-border/60 bg-muted/[0.12] backdrop-blur-[2px]",
						appendix ? "p-5 md:p-6" : "p-5 shadow-sm md:p-7"
					)}
				>
					<ul className={galleryLayoutClass(count)}>
						{images.map((asset, i) => (
							<li
								className="min-w-0 shrink-0 basis-[72%] snap-start sm:basis-[52%] md:shrink md:basis-auto md:snap-align-none"
								key={workImageStableKey(asset, i)}
							>
								<ScreenCard
									asset={asset}
									index={i}
									onOpen={setOpenIndex}
									priority={i === 0}
									screenshotMockup={screenshotMockup}
									title={title}
								/>
							</li>
						))}
					</ul>
				</div>
			</section>

			{openIndex !== null && openAsset !== undefined && (
				<Lightbox
					asset={openAsset}
					index={openIndex}
					onClose={closeLightbox}
					onNext={showNext}
					onPrev={showPrev}
					screenshotMockup={screenshotMockup}
					title={title}
					total={images.length}
				/>
			)}
		</>
	);
}

function ScreenCardMedia({
	asset,
	label,
	priority,
	useIphone17,
	video,
}: {
	asset: WorkImageAsset;
	label: string;
	priority?: boolean;
	useIphone17: boolean;
	video: boolean;
}) {
	if (video) {
		return (
			<div
				aria-hidden
				className="relative aspect-[9/19] w-full overflow-hidden rounded-lg border border-border/40 bg-muted/30 shadow-inner"
			>
				<div className="absolute top-2 left-1/2 z-[1] h-1 w-8 -translate-x-1/2 rounded-full bg-foreground/[0.1]" />
				<video
					autoPlay
					className="absolute inset-0 z-0 h-full w-full object-cover"
					loop
					muted
					playsInline
					preload="metadata"
					src={asset as string}
				/>
			</div>
		);
	}

	if (useIphone17) {
		return <IphoneMockupScreens asset={asset} />;
	}

	return (
		<div
			aria-hidden
			className="relative aspect-[9/19] w-full overflow-hidden rounded-lg border border-border/40 bg-muted/30 shadow-inner"
		>
			<div className="absolute top-2 left-1/2 z-[1] h-1 w-8 -translate-x-1/2 rounded-full bg-foreground/[0.1]" />
			<ThemedScreenshot
				alt={label}
				asset={asset}
				fit="cover"
				priority={priority}
				sizes="(min-width: 640px) 22vw, 78vw"
			/>
		</div>
	);
}

function ScreenCard({
	asset,
	title,
	index,
	priority,
	screenshotMockup,
	onOpen,
}: {
	asset: WorkImageAsset;
	title: string;
	index: number;
	priority?: boolean;
	screenshotMockup?: ScreenshotMockupKind;
	onOpen: (index: number) => void;
}) {
	const open = useCallback(() => onOpen(index), [onOpen, index]);
	const video = isVideoAsset(asset) && typeof asset === "string";
	const useIphone17 = !video && screenshotMockup === "iphone-17-pro";
	const label = `${title}, screen ${index + 1}`;

	return (
		<button
			aria-label={`Open ${label} larger`}
			className={cn(
				"flex h-full w-full flex-col text-left outline-none transition-[box-shadow,transform,border-color,opacity] duration-200",
				useIphone17
					? "rounded-2xl border border-transparent bg-transparent p-2 shadow-none hover:border-border/40 hover:bg-muted/10"
					: "rounded-xl border border-border/50 bg-background/80 p-2.5 shadow-sm hover:z-[1] hover:border-foreground/20 hover:shadow-md",
				"focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
			)}
			onClick={open}
			type="button"
		>
			<ScreenCardMedia
				asset={asset}
				label={label}
				priority={priority}
				useIphone17={useIphone17}
				video={video}
			/>
			<span className="mt-2.5 flex items-center justify-between gap-2 px-0.5 font-normal text-[10px] text-muted-foreground uppercase tracking-[0.16em]">
				<span className="tabular-nums">
					{video ? "clip" : "screen"} · {index + 1}
				</span>
			</span>
		</button>
	);
}

function LightboxStill({
	alt,
	asset,
	useIphone17,
}: {
	alt: string;
	asset: WorkImageAsset;
	useIphone17: boolean;
}) {
	if (useIphone17) {
		return (
			<IphoneMockupScreens
				asset={asset}
				className="max-w-[min(100%,300px)] sm:max-w-[min(100%,320px)]"
			/>
		);
	}

	return (
		<div className="relative aspect-[9/19] w-full overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl ring-1 ring-black/10 dark:ring-white/10">
			<ThemedScreenshot
				alt={alt}
				asset={asset}
				fit="contain"
				priority
				sizes="(min-width: 640px) 420px, 100vw"
			/>
		</div>
	);
}

function Lightbox({
	asset,
	title,
	index,
	total,
	screenshotMockup,
	onClose,
	onPrev,
	onNext,
}: {
	asset: WorkImageAsset;
	title: string;
	index: number;
	total: number;
	screenshotMockup?: ScreenshotMockupKind;
	onClose: () => void;
	onPrev: () => void;
	onNext: () => void;
}) {
	const video = isVideoAsset(asset) && typeof asset === "string";
	const useIphone17 = !video && screenshotMockup === "iphone-17-pro";

	return (
		<div
			aria-label={`${title}, ${index + 1} of ${total}`}
			aria-modal="true"
			className="fixed inset-0 z-[100] flex items-center justify-center p-4"
			role="dialog"
		>
			<button
				aria-label="Close gallery"
				className="absolute inset-0 bg-background/88 backdrop-blur-md"
				onClick={onClose}
				type="button"
			/>

			<button
				aria-label="Close"
				className="absolute top-4 right-4 z-[2] inline-flex rounded-full border border-border/80 bg-background/90 p-2 text-foreground shadow-sm transition-colors hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
				onClick={onClose}
				type="button"
			>
				<X className="h-5 w-5" />
			</button>

			{total > 1 && (
				<>
					<button
						aria-label="Previous"
						className="absolute top-1/2 left-2 z-[2] -translate-y-1/2 rounded-full border border-border/80 bg-background/90 p-2.5 shadow-sm transition-colors hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-25 sm:left-4"
						disabled={index === 0}
						onClick={onPrev}
						type="button"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						aria-label="Next"
						className="absolute top-1/2 right-2 z-[2] -translate-y-1/2 rounded-full border border-border/80 bg-background/90 p-2.5 shadow-sm transition-colors hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-25 sm:right-4"
						disabled={index === total - 1}
						onClick={onNext}
						type="button"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				</>
			)}

			<div
				className={cn(
					"relative z-[1] flex max-h-[min(88vh,860px)] w-full flex-col items-center",
					useIphone17 ? "max-w-[min(100%,340px)]" : "max-w-[min(100%,420px)]"
				)}
			>
				{video ? (
					<div className="relative aspect-[9/19] w-full overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl ring-1 ring-black/10 dark:ring-white/10">
						{/* biome-ignore lint/a11y/useMediaCaption: silent ui screen recording, there is no speech to caption */}
						<video
							className="absolute inset-0 h-full w-full object-contain"
							controls
							playsInline
							src={asset}
						/>
					</div>
				) : (
					<LightboxStill
						alt={`${title}, full size ${index + 1}`}
						asset={asset}
						useIphone17={useIphone17}
					/>
				)}
				{total > 1 && (
					<p className="meta-tag mt-4 tabular-nums">
						{index + 1} / {total}
					</p>
				)}
			</div>
		</div>
	);
}
