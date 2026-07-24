"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { WorkLogoAsset } from "@/lib/types/types";
import { cn } from "@/lib/utils";
import { isPairedScreenshots } from "@/lib/work-image";

/** Colour channels are bucketed into 8 bands so near-identical pixels group. */
const BUCKET_SIZE = 32;
/** The logo is downsampled to this square before sampling. */
const SAMPLE_SIZE = 32;
const ALPHA_FLOOR = 200;
const LUMA_CEILING = 240;
const LUMA_FLOOR = 15;

interface ColorBucket {
	b: number;
	g: number;
	n: number;
	r: number;
	score: number;
}

/** Bucket the pixels, then take the bucket with the most saturated mass. */
function bucketPixels(data: Uint8ClampedArray) {
	const buckets = new Map<string, ColorBucket>();

	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] < ALPHA_FLOOR) {
			continue;
		}
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const lum = (r + g + b) / 3;
		if (lum > LUMA_CEILING || lum < LUMA_FLOOR) {
			continue;
		}
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const sat = max === 0 ? 0 : (max - min) / max;
		const key = `${Math.floor(r / BUCKET_SIZE)}-${Math.floor(g / BUCKET_SIZE)}-${Math.floor(b / BUCKET_SIZE)}`;
		const cur = buckets.get(key) ?? { b: 0, g: 0, n: 0, r: 0, score: 0 };
		cur.r += r;
		cur.g += g;
		cur.b += b;
		cur.n += 1;
		cur.score += 1 + sat * 2;
		buckets.set(key, cur);
	}

	return buckets;
}

function dominantColor(img: HTMLImageElement): string | null {
	try {
		const canvas = document.createElement("canvas");
		canvas.width = SAMPLE_SIZE;
		canvas.height = SAMPLE_SIZE;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) {
			return null;
		}
		ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
		const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

		let best: ColorBucket | null = null;
		for (const v of bucketPixels(data).values()) {
			if (!best || v.score > best.score) {
				best = v;
			}
		}
		if (!best) {
			return null;
		}

		const r = Math.round(best.r / best.n);
		const g = Math.round(best.g / best.n);
		const b = Math.round(best.b / best.n);
		return `rgb(${r} ${g} ${b} / 0.15)`;
	} catch {
		// CORS or decode errors just mean no tint
		return null;
	}
}

interface Props {
	alt?: string;
	boxClassName?: string;
	className?: string;
	imagePadClassName?: string;
	size?: number;
	src: WorkLogoAsset;
}

export function LogoTile({
	src,
	alt = "",
	size,
	boxClassName,
	imagePadClassName = "p-1.5",
	className,
}: Props) {
	const [bg, setBg] = useState<string | null>(null);
	const cancelled = useRef(false);
	const sampleSrc = isPairedScreenshots(src) ? src.light : src;
	const usingClassSize = Boolean(boxClassName);
	const fallbackSize = size ?? 32;

	useEffect(() => {
		cancelled.current = false;
		const img = new window.Image();
		img.crossOrigin = "anonymous";
		img.src = sampleSrc;
		img.onload = () => {
			if (cancelled.current) {
				return;
			}
			const dominant = dominantColor(img);
			if (dominant) {
				setBg(dominant);
			}
		};
		return () => {
			cancelled.current = true;
		};
	}, [sampleSrc]);

	const sizesAttr = usingClassSize ? undefined : `${fallbackSize}px`;

	return (
		<span
			className={cn(
				"relative shrink-0 overflow-hidden rounded-md transition-colors duration-300",
				bg ? "" : "bg-muted/40",
				boxClassName,
				className
			)}
			style={
				usingClassSize
					? { backgroundColor: bg ?? undefined }
					: {
							backgroundColor: bg ?? undefined,
							height: fallbackSize,
							width: fallbackSize,
						}
			}
		>
			{isPairedScreenshots(src) ? (
				<>
					<Image
						alt={alt}
						className={cn("object-contain dark:hidden", imagePadClassName)}
						fill
						sizes={sizesAttr}
						src={src.light}
					/>
					<Image
						alt={alt}
						className={cn(
							"hidden object-contain dark:block",
							imagePadClassName
						)}
						fill
						sizes={sizesAttr}
						src={src.dark}
					/>
				</>
			) : (
				<Image
					alt={alt}
					className={cn("object-contain", imagePadClassName)}
					fill
					sizes={sizesAttr}
					src={src}
				/>
			)}
		</span>
	);
}
