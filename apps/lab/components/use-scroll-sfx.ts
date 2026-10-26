"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { playSfx } from "@/lib/sfx";

const MIN_TRAVEL_PX = 80;
const INPUT_WINDOW_MS = 1500;
const SCROLL_KEYS = new Set([
	"ArrowDown",
	"ArrowUp",
	"PageDown",
	"PageUp",
	"Home",
	"End",
	" ",
]);
const EDITABLE = "input, textarea, select, button, [contenteditable]";

// A hit test follows both ordinary pages and Strip's translated horizontal panels.
const sectionAtCenter = (): Element | null =>
	document
		.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
		?.closest("main section, main article") ?? null;

export function useScrollSfx(enabled: boolean): void {
	const pathname = usePathname();

	useEffect(() => {
		if (!(enabled && pathname)) {
			return;
		}
		const reduced = matchMedia("(prefers-reduced-motion: reduce)");
		let currentSection = sectionAtCenter();
		let lastInput = Number.NEGATIVE_INFINITY;
		let lastY = window.scrollY;
		let travel = 0;
		let frame = 0;
		const markInput = () => {
			lastInput = performance.now();
		};
		const onKey = (event: KeyboardEvent) => {
			if (
				SCROLL_KEYS.has(event.key) &&
				!event.metaKey &&
				!event.ctrlKey &&
				!event.altKey &&
				!(event.target instanceof Element && event.target.closest(EDITABLE))
			) {
				markInput();
			}
		};
		const onPointer = (event: PointerEvent) => {
			// Dragging the browser's scrollbar is a scroll gesture too.
			if (
				event.buttons === 1 &&
				event.clientX >= document.documentElement.clientWidth
			) {
				markInput();
			}
		};
		const checkSection = async () => {
			frame = 0;
			const next = sectionAtCenter();
			if (!next || next === currentSection) {
				return;
			}
			const previous = currentSection;
			currentSection = next;
			if (
				!previous ||
				reduced.matches ||
				travel < MIN_TRAVEL_PX ||
				performance.now() - lastInput > INPUT_WINDOW_MS
			) {
				return;
			}
			travel = 0;
			await playSfx("scroll");
		};
		const onScroll = () => {
			travel += Math.abs(window.scrollY - lastY);
			lastY = window.scrollY;
			if (!frame) {
				frame = requestAnimationFrame(checkSection);
			}
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("wheel", markInput, { passive: true });
		window.addEventListener("touchmove", markInput, { passive: true });
		window.addEventListener("keydown", onKey);
		window.addEventListener("pointerdown", onPointer, { passive: true });
		window.addEventListener("pointermove", onPointer, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("wheel", markInput);
			window.removeEventListener("touchmove", markInput);
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("pointerdown", onPointer);
			window.removeEventListener("pointermove", onPointer);
		};
	}, [enabled, pathname]);
}
