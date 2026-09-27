"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A live media query. The server (and the first client render) sees
 * `fallback`, so markup that depends on it hydrates without a mismatch.
 */
export function useMediaQuery(query: string, fallback = false) {
	const subscribe = useCallback(
		(onChange: () => void) => {
			const list = window.matchMedia(query);
			list.addEventListener("change", onChange);
			return () => list.removeEventListener("change", onChange);
		},
		[query]
	);
	const getSnapshot = useCallback(
		() => window.matchMedia(query).matches,
		[query]
	);
	const getServerSnapshot = useCallback(() => fallback, [fallback]);
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** a mouse or trackpad: cursor and hover effects mean nothing on touch */
export const useFinePointer = () =>
	useMediaQuery("(hover: hover) and (pointer: fine)");

export const useReducedMotionPreference = () =>
	useMediaQuery("(prefers-reduced-motion: reduce)");
