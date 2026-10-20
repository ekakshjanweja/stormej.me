import Image from "next/image";
import type { WorkImageAsset } from "@/lib/types/types";
import { cn } from "@/lib/utils";
import { isPairedScreenshots, workImageStableKey } from "@/lib/work-image";

/** two phones per spread; a desktop shot gets the whole width */
const MAX_PORTRAIT = 2;
const MAX_LANDSCAPE = 1;

function Shot({
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
			<div className={className}>
				<Image
					alt={alt}
					className="object-cover object-top dark:hidden"
					fill
					sizes={sizes}
					src={asset.light}
				/>
				<Image
					alt={alt}
					className="hidden object-cover object-top dark:block"
					fill
					sizes={sizes}
					src={asset.dark}
				/>
			</div>
		);
	}
	return (
		<div className={className}>
			<Image
				alt={alt}
				className="object-cover object-top"
				fill
				sizes={sizes}
				src={asset}
			/>
		</div>
	);
}

/**
 * The screens for one part of the story, as shown in a spread: up to two
 * phones side by side (gently staggered), or one desktop shot at full width.
 */
export function StoryMedia({
	media,
	landscape = false,
	label,
	className,
}: {
	media: WorkImageAsset[];
	landscape?: boolean;
	label: string;
	className?: string;
}) {
	const shots = media.slice(0, landscape ? MAX_LANDSCAPE : MAX_PORTRAIT);
	if (shots.length === 0) {
		return null;
	}
	const shotClass = cn(
		"relative shrink-0 overflow-hidden border border-border/60 bg-background shadow-[0_24px_48px_-28px_rgb(0_0_0/0.35)]",
		landscape ? "story-shot--landscape rounded-lg" : "story-shot--portrait"
	);
	return (
		<div
			className={cn(
				"story-media flex items-center justify-center gap-6",
				!landscape && shots.length === 2 && "story-media--pair",
				className
			)}
		>
			{shots.map((asset, i) => (
				<Shot
					alt={`${label}, screen ${i + 1}`}
					asset={asset}
					className={shotClass}
					key={workImageStableKey(asset, i)}
					sizes={landscape ? "(min-width: 1024px) 640px, 92vw" : "280px"}
				/>
			))}
		</div>
	);
}
