"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { LogoTile } from "@/components/logo-tile";
import { Iphone17Pro } from "@/components/ui/iphone-17-pro";
import { track } from "@/lib/analytics";
import type {
	ScreenshotMockupKind,
	WorkImageAsset,
	WorkLogoAsset,
} from "@/lib/types/types";
import { cn } from "@/lib/utils";
import {
	formatTotalExperienceAriaLabel,
	formatTotalExperienceShort,
	listWork,
	listWorkForHome,
} from "@/lib/work";
import {
	isPairedScreenshots,
	isVideoAsset,
	workImageStableKey,
} from "@/lib/work-image";

const PLACEHOLDER_GRADIENTS = [
	"from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800",
	"from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800",
	"from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800",
];

function formatRange(start: Date, end?: Date | null) {
	const fmt = (d: Date) =>
		d
			.toLocaleString("default", { month: "short", year: "numeric" })
			.toLowerCase();
	return `${fmt(start)} to ${end ? fmt(end) : "present"}`;
}

export default function Work() {
	const work = listWork();
	const totalExp = formatTotalExperienceShort(work);
	const totalExpAria = formatTotalExperienceAriaLabel(work);
	const homeWork = listWorkForHome();
	return (
		<section data-cursor-anchor="work">
			<div className="mb-6 flex items-baseline justify-between gap-4">
				<h2 className="section-label inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5">
					<span>work</span>
					{totalExp ? (
						<span
							aria-label={totalExpAria}
							className="meta-tag normal-case tracking-[0.06em]"
							role="note"
						>
							({totalExp})
						</span>
					) : null}
				</h2>
				<Link
					className="meta-tag hover-dim rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
					href="/work"
				>
					view all
				</Link>
			</div>
			<ul className="flex flex-col">
				{homeWork.map((item) => (
					<HomeWorkItem item={item} key={item.slug} />
				))}
			</ul>
		</section>
	);
}

function HomeWorkItem({
	item,
}: {
	item: ReturnType<typeof listWorkForHome>[number];
}) {
	const [isHovered, setIsHovered] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const showPreview = isHovered || isFocused;

	const onMouseEnter = useCallback(() => setIsHovered(true), []);
	const onMouseLeave = useCallback(() => setIsHovered(false), []);
	const onFocus = useCallback(() => setIsFocused(true), []);
	const onBlur = useCallback(() => setIsFocused(false), []);
	const onClick = useCallback(
		() =>
			track("content_card_clicked", {
				kind: "work",
				slug: item.slug,
				title: item.title,
			}),
		[item.slug, item.title]
	);

	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: hover only reveals the preview; the link inside carries the same state via focus
		<li
			className="group/work relative py-4 first:pt-0 last:pb-0 focus-within:z-50 hover:z-50"
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			<Link
				className="group flex items-center gap-4 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				href={`/work/${item.slug}`}
				onBlur={onBlur}
				onClick={onClick}
				onFocus={onFocus}
			>
				{item.logo ? (
					<LogoTile boxClassName="h-9 w-9" src={item.logo} />
				) : (
					<span
						aria-hidden
						className="w-9 shrink-0 select-none text-center font-serif text-[34px] text-foreground/85 italic leading-none"
						style={{
							fontFamily: "var(--font-instrument-serif), serif",
						}}
					>
						{item.title.charAt(0).toLowerCase()}
					</span>
				)}
				<div className="flex min-w-0 flex-1 items-center justify-between gap-3 sm:gap-4">
					<div className="flex min-w-0 flex-1 flex-col gap-0.5">
						<span className="squiggle-link-hover truncate font-medium text-[14px] text-foreground">
							{item.title}
						</span>
						<span className="font-light text-[12px] text-muted-foreground leading-tight">
							{item.role}
						</span>
						<span className="meta-tag mt-0.5 whitespace-nowrap sm:hidden">
							{formatRange(item.startDate, item.endDate)}
						</span>
					</div>
					<span className="meta-tag hidden shrink-0 whitespace-nowrap sm:inline">
						{formatRange(item.startDate, item.endDate)}
					</span>
				</div>
			</Link>
			<HomeWorkPreview
				href={`/work/${item.slug}`}
				images={item.images}
				logo={item.logo}
				screenshotMockup={item.screenshotMockup}
				title={item.title}
				visible={showPreview}
			/>
		</li>
	);
}

/** Slot keys for the hover preview: the asset when there is one, a fixed
 * placeholder token otherwise. The list is a fixed three and never reorders. */
function slotKey(src: WorkImageAsset | null, index: number) {
	return src === null ? `placeholder-${index}` : workImageStableKey(src, index);
}

function HomeWorkPreview({
	title,
	href,
	logo,
	images,
	screenshotMockup,
	visible,
}: {
	title: string;
	href: string;
	logo?: WorkLogoAsset;
	images?: WorkImageAsset[];
	screenshotMockup?: ScreenshotMockupKind;
	visible: boolean;
}) {
	const slots =
		images && images.length > 0 ? images.slice(0, 3) : [null, null, null];

	return (
		<div
			aria-hidden="true"
			className={cn(
				"absolute bottom-full left-0 z-50 mb-3 hidden min-w-0 origin-bottom-left rounded-md border border-border bg-popover shadow-sm transition-all duration-150 ease-out md:block",
				visible
					? "pointer-events-auto translate-y-0 scale-100 opacity-100"
					: "pointer-events-none translate-y-1 scale-[0.98] opacity-0"
			)}
		>
			<Link
				className="box-border flex w-[min(292px,calc(100vw-2rem))] min-w-0 shrink-0 flex-col overflow-hidden transition-colors duration-150 hover:border-foreground/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				href={href}
				tabIndex={-1}
			>
				<div className="flex w-full items-end justify-center gap-2 px-3 pt-3 pb-2">
					{slots.map((src, i) => (
						<HomePreviewPhone
							gradient={PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length]}
							key={slotKey(src, i)}
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
		</div>
	);
}

function PhoneSlotMedia({
	src,
	title,
	useIphone17,
}: {
	src: WorkImageAsset;
	title: string;
	useIphone17: boolean;
}) {
	if (typeof src === "string" && isVideoAsset(src)) {
		return (
			<video
				autoPlay
				className="absolute inset-0 h-full w-full object-cover"
				loop
				muted
				playsInline
				preload="metadata"
				src={src}
			/>
		);
	}

	if (useIphone17) {
		if (isPairedScreenshots(src)) {
			return (
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
			);
		}
		if (typeof src === "string") {
			return <Iphone17Pro height={148} src={src} width={74} />;
		}
		return null;
	}

	if (isPairedScreenshots(src)) {
		return (
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
		);
	}

	return (
		<Image
			alt={`${title} screenshot`}
			className="object-cover"
			fill
			sizes="80px"
			src={src}
		/>
	);
}

function PhoneSlotLogo({ logo }: { logo: WorkLogoAsset }) {
	if (isPairedScreenshots(logo)) {
		return (
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
		);
	}
	return (
		<Image alt="" className="object-contain" fill sizes="24px" src={logo} />
	);
}

function HomePreviewPhone({
	src,
	logo,
	title,
	screenshotMockup,
	gradient,
}: {
	src: WorkImageAsset | null;
	logo?: WorkLogoAsset;
	title: string;
	screenshotMockup?: ScreenshotMockupKind;
	gradient: string;
}) {
	const useIphone17 =
		Boolean(src) &&
		screenshotMockup === "iphone-17-pro" &&
		!(typeof src === "string" && isVideoAsset(src));

	return (
		<div
			className={cn(
				"relative flex shrink-0 items-center justify-center",
				useIphone17
					? "h-[158px] w-[84px] overflow-visible px-px"
					: "h-[160px] w-[80px] overflow-hidden rounded-[10px] border border-border/80 bg-background shadow-sm"
			)}
		>
			{src ? (
				<PhoneSlotMedia src={src} title={title} useIphone17={useIphone17} />
			) : (
				<div className={cn("absolute inset-0 bg-gradient-to-br", gradient)}>
					<div className="absolute top-2 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-foreground/20" />
					{logo && (
						<span className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 opacity-50">
							<PhoneSlotLogo logo={logo} />
						</span>
					)}
				</div>
			)}
		</div>
	);
}
