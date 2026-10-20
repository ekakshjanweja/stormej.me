"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { WorkImageAsset, WorkLogoAsset } from "@/lib/types/types";
import { isPairedScreenshots, workImageStableKey } from "@/lib/work-image";

const SLOTS = ["center", "left", "right"] as const;

/**
 * On touch screens there is no hover, so a card reveals while it sits in the
 * middle band of the viewport and settles back once it scrolls on.
 */
const TOUCH_BAND = "-38% 0px -38% 0px";

function Themed({
	asset,
	alt,
	className,
	sizes,
}: {
	asset: WorkImageAsset;
	alt: string;
	className: string;
	sizes: string;
}) {
	if (isPairedScreenshots(asset)) {
		return (
			<>
				<Image
					alt={alt}
					className={`${className} dark:hidden`}
					fill
					sizes={sizes}
					src={asset.light}
				/>
				<Image
					alt={alt}
					className={`${className} hidden dark:block`}
					fill
					sizes={sizes}
					src={asset.dark}
				/>
			</>
		);
	}
	return (
		<Image alt={alt} className={className} fill sizes={sizes} src={asset} />
	);
}

/**
 * The logo, resting in the middle of the card. Hover (or, on touch, scroll the
 * card to the centre) and it lifts away while the app's screens rise in from
 * below, one after another.
 */
export function LogoReveal({
	logo,
	images = [],
	title,
}: {
	logo?: WorkLogoAsset;
	images?: WorkImageAsset[];
	title: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState(false);
	const screens = images.slice(0, SLOTS.length);
	const canReveal = screens.length > 0;

	useEffect(() => {
		const node = ref.current;
		if (!(node && canReveal)) {
			return;
		}
		if (!window.matchMedia("(hover: none)").matches) {
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => setActive(Boolean(entry?.isIntersecting)),
			{ rootMargin: TOUCH_BAND }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [canReveal]);

	return (
		<div
			className="logo-reveal"
			data-active={active ? "" : undefined}
			data-reveal={canReveal ? "" : undefined}
			ref={ref}
		>
			<div className="logo-reveal__logo">
				{logo ? (
					<div className="relative h-full w-full">
						<Themed
							alt={title}
							asset={logo}
							className="object-contain"
							sizes="160px"
						/>
					</div>
				) : (
					<span
						aria-hidden
						className="select-none font-serif text-[72px] text-foreground/70 italic leading-none"
					>
						{title.charAt(0).toLowerCase()}
					</span>
				)}
			</div>
			{screens.map((asset, i) => (
				<div
					aria-hidden
					className="logo-reveal__screen"
					data-slot={SLOTS[i]}
					key={workImageStableKey(asset, i)}
				>
					<Themed
						alt=""
						asset={asset}
						className="object-cover object-top"
						sizes="140px"
					/>
				</div>
			))}
		</div>
	);
}
