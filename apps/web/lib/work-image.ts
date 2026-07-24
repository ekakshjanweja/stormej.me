import type { WorkImageAsset } from "@/lib/types/types";

export function workImageStableKey(asset: WorkImageAsset, index: number) {
	return typeof asset === "string"
		? asset
		: `${asset.light}|${asset.dark}|${index}`;
}

const VIDEO_EXTENSION = /\.(mp4|webm|mov)$/i;

export function isVideoAsset(asset: WorkImageAsset) {
	const path = typeof asset === "string" ? asset : asset.light;
	return VIDEO_EXTENSION.test(path);
}

export function isPairedScreenshots(asset: WorkImageAsset): asset is {
	light: string;
	dark: string;
} {
	return typeof asset !== "string";
}
