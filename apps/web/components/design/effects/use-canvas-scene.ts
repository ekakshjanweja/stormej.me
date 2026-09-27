"use client";

import { useEffect, useRef } from "react";

/** device pixels beyond 2× cost fill rate and nobody can see the difference */
const MAX_PIXEL_RATIO = 2;
/** a long pause (a hidden tab, a breakpoint) shouldn't fast-forward the scene */
const MAX_FRAME_SECONDS = 0.1;

export interface CanvasScene {
	/**
	 * Draws one frame. `time` is seconds of animation so far (it stops while
	 * the scene is paused), `delta` the seconds since the previous frame.
	 */
	draw: (ctx: CanvasRenderingContext2D, time: number, delta: number) => void;
	/** called with the new size in css pixels whenever the canvas resizes */
	resize: (width: number, height: number) => void;
}

/**
 * Runs a canvas scene on requestAnimationFrame: sized for the device pixel
 * ratio, paused while the tab is hidden or the canvas is off screen (a
 * studio preview scrolled away), and reduced to a single frame when `still`.
 * `redraw` repaints a still scene, e.g. after the palette changes.
 */
export function useCanvasScene(
	scene: CanvasScene,
	{ redraw, still }: { redraw?: unknown; still: boolean }
) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const paintRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!(canvas && ctx)) {
			return;
		}

		let frame = 0;
		let last = 0;
		let time = 0;
		let visible = !document.hidden;
		let onScreen = true;

		const paint = () => {
			scene.draw(ctx, time, 0);
		};
		paintRef.current = paint;

		const resize = () => {
			const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;
			canvas.width = Math.max(1, Math.round(width * ratio));
			canvas.height = Math.max(1, Math.round(height * ratio));
			ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
			scene.resize(width, height);
			paint();
		};

		const tick = (now: number) => {
			const delta = Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
			last = now;
			time += delta;
			scene.draw(ctx, time, delta);
			frame = requestAnimationFrame(tick);
		};

		const sync = () => {
			const running = !still && visible && onScreen;
			if (running && !frame) {
				last = performance.now();
				frame = requestAnimationFrame(tick);
			} else if (!running && frame) {
				cancelAnimationFrame(frame);
				frame = 0;
			}
		};

		const onVisibility = () => {
			visible = !document.hidden;
			sync();
		};

		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(canvas);
		const intersectionObserver = new IntersectionObserver(([entry]) => {
			onScreen = entry?.isIntersecting ?? true;
			sync();
		});
		intersectionObserver.observe(canvas);
		document.addEventListener("visibilitychange", onVisibility);

		resize();
		sync();

		return () => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
			document.removeEventListener("visibilitychange", onVisibility);
			paintRef.current = null;
		};
	}, [scene, still]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: redraw is the trigger, not a value the effect reads
	useEffect(() => {
		paintRef.current?.();
	}, [redraw]);

	return canvasRef;
}
