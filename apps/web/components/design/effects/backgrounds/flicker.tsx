"use client";

// adapted from magic ui's flickering-grid (magicui.design)
import { useMemo, useRef } from "react";
import { type CanvasScene, useCanvasScene } from "../use-canvas-scene";
import { isDark, mixRgb, rgba, useThemeColours } from "../use-theme-colours";
import type { BackgroundProps } from "./types";

const SQUARE = 3;
const GAP = 7;
const PITCH = SQUARE + GAP;
/** chance a square changes brightness, per second */
const FLICKER_RATE = 0.4;
const MAX_OPACITY_LIGHT = 0.32;
const MAX_OPACITY_DARK = 0.24;
/** a flicker doesn't need 60fps; redrawing ~13k squares 24 times a second is plenty */
const FRAME_SECONDS = 1 / 24;

export function Flicker({ still }: BackgroundProps) {
	const colours = useThemeColours();
	const coloursRef = useRef(colours);
	coloursRef.current = colours;

	const scene = useMemo<CanvasScene>(() => {
		let width = 0;
		let height = 0;
		let columns = 0;
		let rows = 0;
		let cells = new Float32Array(0);
		let pending = 0;

		return {
			// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Keep the canvas update and paint in one frame to avoid allocating closures per frame.
			draw(ctx, _time, delta) {
				pending += delta;
				// delta is 0 for a one-off repaint; always honour those
				if (delta > 0 && pending < FRAME_SECONDS) {
					return;
				}
				const chance = FLICKER_RATE * pending;
				pending = 0;
				for (let index = 0; index < cells.length; index += 1) {
					if (Math.random() < chance) {
						cells[index] = Math.random();
					}
				}

				const { accent, background, foreground } = coloursRef.current;
				const peak = isDark(background) ? MAX_OPACITY_DARK : MAX_OPACITY_LIGHT;
				ctx.clearRect(0, 0, width, height);
				ctx.fillStyle = rgba(mixRgb(foreground, accent, 0.55));
				for (let column = 0; column < columns; column += 1) {
					for (let row = 0; row < rows; row += 1) {
						ctx.globalAlpha = (cells[column * rows + row] ?? 0) * peak;
						ctx.fillRect(column * PITCH, row * PITCH, SQUARE, SQUARE);
					}
				}
				ctx.globalAlpha = 1;
			},
			resize(nextWidth, nextHeight) {
				width = nextWidth;
				height = nextHeight;
				columns = Math.ceil(width / PITCH);
				rows = Math.ceil(height / PITCH);
				cells = new Float32Array(columns * rows);
				for (let index = 0; index < cells.length; index += 1) {
					cells[index] = Math.random();
				}
			},
		};
	}, []);

	const canvasRef = useCanvasScene(scene, { redraw: colours, still });

	return <canvas className="fx-canvas fx-flicker" ref={canvasRef} />;
}
