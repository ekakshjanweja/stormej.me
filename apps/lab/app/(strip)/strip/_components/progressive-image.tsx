"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";
import { BASE_PATH, withBase } from "@/lib/base";
import images from "@/lib/strip-images.json";

interface ImageAsset {
	preview: string;
	sources: { src: string; width: number }[];
}

const assets: Record<string, ImageAsset> = images;

type ProgressiveImageProps = Omit<
	ImageProps,
	"src" | "onLoad" | "onError" | "priority" | "preload"
> & {
	loadFull?: boolean;
	src: string;
};

/* Inline previews paint without another request. The picture's source
   supplies static responsive files because this app bypasses /_next/image. */
export function ProgressiveImage({
	src,
	fill,
	sizes,
	loadFull = true,
	...props
}: ProgressiveImageProps) {
	const [loadedSource, setLoadedSource] = useState<string | null>(null);
	const onLoad = useCallback(() => setLoadedSource(src), [src]);
	const onError = useCallback(() => setLoadedSource(null), []);
	const path =
		BASE_PATH && src.startsWith(`${BASE_PATH}/`)
			? src.slice(BASE_PATH.length)
			: src;
	const asset = assets[path];

	if (!asset) {
		return <Image {...props} fill={fill} sizes={sizes} src={src} />;
	}

	const srcSet = asset.sources
		.map((source) => `${withBase(source.src)} ${source.width}w`)
		.join(", ");

	return (
		<span
			className="progressive-image"
			data-fill={fill ? "" : undefined}
			data-loaded={loadedSource === src ? "" : undefined}
		>
			<Image
				alt=""
				aria-hidden="true"
				className="progressive-preview"
				draggable={false}
				fill
				loading="eager"
				src={asset.preview}
				unoptimized
			/>
			{loadFull || loadedSource === src ? (
				<picture>
					<source sizes={sizes} srcSet={srcSet} type="image/webp" />
					<Image
						{...props}
						className="progressive-full"
						fill={fill}
						key={src}
						onError={onError}
						onLoad={onLoad}
						sizes={sizes}
						src={src}
					/>
				</picture>
			) : null}
		</span>
	);
}
