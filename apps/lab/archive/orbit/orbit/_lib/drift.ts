"use client";

import { type RefObject, useEffect } from "react";
import { damp, prefersReducedMotion } from "@/lib/motion";

/* layers marked data-depth drift against the pointer, a few px each. the
   loop sleeps once everything has arrived and while the scene is off
   screen, so a still page costs nothing */

/** px of drift for a layer with data-depth="1" at the screen's edge */
const PARALLAX = 1;
const FOLLOW = 3.5;
/** below this the layers are where they should be */
const REST = 0.0005;

export function useDrift(
	ref: RefObject<HTMLElement | null>,
	enabled = true
): void {
	useEffect(() => {
		const scene = ref.current;
		if (
			!(scene && enabled) ||
			prefersReducedMotion() ||
			!window.matchMedia("(pointer: fine)").matches
		) {
			return;
		}
		const layers = Array.from(
			scene.querySelectorAll<HTMLElement>("[data-depth]")
		).map((el) => ({ depth: Number(el.dataset.depth), el }));
		let targetX = 0;
		let targetY = 0;
		let x = 0;
		let y = 0;
		let last = 0;
		let frame = 0;
		let visible = true;

		const tick = (now: number) => {
			const dt = Math.min(now - last, 64) / 1000;
			last = now;
			x = damp(x, targetX, FOLLOW, dt);
			y = damp(y, targetY, FOLLOW, dt);
			for (const layer of layers) {
				const shift = layer.depth * PARALLAX;
				layer.el.style.translate = `${(-x * shift).toFixed(2)}px ${(-y * shift * 0.6).toFixed(2)}px`;
			}
			const settled =
				Math.abs(targetX - x) < REST && Math.abs(targetY - y) < REST;
			frame = settled ? 0 : requestAnimationFrame(tick);
		};
		const wake = () => {
			if (frame === 0 && visible) {
				last = performance.now();
				frame = requestAnimationFrame(tick);
			}
		};
		const onMove = (event: PointerEvent) => {
			targetX = (event.clientX / window.innerWidth) * 2 - 1;
			targetY = (event.clientY / window.innerHeight) * 2 - 1;
			wake();
		};
		const observer = new IntersectionObserver(([entry]) => {
			visible = entry?.isIntersecting ?? true;
			if (!visible) {
				cancelAnimationFrame(frame);
				frame = 0;
			}
		});
		observer.observe(scene);
		window.addEventListener("pointermove", onMove, { passive: true });
		return () => {
			window.removeEventListener("pointermove", onMove);
			observer.disconnect();
			cancelAnimationFrame(frame);
		};
	}, [ref, enabled]);
}
