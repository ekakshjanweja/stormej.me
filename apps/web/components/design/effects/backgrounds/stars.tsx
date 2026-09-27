"use client";

// adapted from aceternity's stars-background and shooting-stars (ui.aceternity.com)
import { useMemo, useRef } from "react";
import { type CanvasScene, useCanvasScene } from "../use-canvas-scene";
import { isDark, rgba, useThemeColours } from "../use-theme-colours";
import type { BackgroundProps } from "./types";

/** stars per square css pixel */
const STAR_DENSITY = 0.000_14;
const MAX_STARS = 420;
const MIN_SHOOTING_GAP_SECONDS = 2.5;
const MAX_SHOOTING_GAP_SECONDS = 6;
const SHOOTING_SPEED = 900;
const SHOOTING_TAIL = 140;
const TAU = Math.PI * 2;

interface Star {
	opacity: number;
	phase: number;
	radius: number;
	/** seconds per twinkle, or 0 for a steady star */
	twinkle: number;
	x: number;
	y: number;
}

interface ShootingStar {
	angle: number;
	travelled: number;
	x: number;
	y: number;
}

const between = (min: number, max: number) => min + Math.random() * (max - min);

function launch(width: number, height: number): ShootingStar {
	// from somewhere along the top or the right, heading down and left or right
	const fromTop = Math.random() < 0.6;
	const leftward = Math.random() < 0.5;
	let originX = 0;
	if (fromTop) {
		originX = between(0.1, 0.9) * width;
	} else if (leftward) {
		originX = width;
	}
	return {
		angle: leftward ? between(2.2, 2.6) : between(0.55, 0.95),
		travelled: 0,
		x: originX,
		y: fromTop ? 0 : between(0, 0.4) * height,
	};
}

export function Stars({ still }: BackgroundProps) {
	const colours = useThemeColours();
	const coloursRef = useRef(colours);
	coloursRef.current = colours;

	const scene = useMemo<CanvasScene>(() => {
		let width = 0;
		let height = 0;
		let stars: Star[] = [];
		let shooting: ShootingStar | null = null;
		let nextShot = between(0.5, MIN_SHOOTING_GAP_SECONDS);

		return {
			// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Twinkling and shooting stars share this frame's canvas state.
			draw(ctx, time, delta) {
				const { accent, background, foreground } = coloursRef.current;
				const dim = isDark(background) ? 0.8 : 0.5;
				ctx.clearRect(0, 0, width, height);
				ctx.fillStyle = rgba(foreground);
				for (const star of stars) {
					const shimmer = star.twinkle
						? 0.55 + 0.45 * Math.sin((time / star.twinkle) * TAU + star.phase)
						: 1;
					ctx.globalAlpha = star.opacity * shimmer * dim;
					ctx.beginPath();
					ctx.arc(star.x, star.y, star.radius, 0, TAU);
					ctx.fill();
				}
				ctx.globalAlpha = 1;

				// a still scene gets the stars and nothing streaking through them
				if (delta === 0) {
					return;
				}
				nextShot -= delta;
				if (!shooting && nextShot <= 0) {
					shooting = launch(width, height);
					nextShot = between(
						MIN_SHOOTING_GAP_SECONDS,
						MAX_SHOOTING_GAP_SECONDS
					);
				}
				if (!shooting) {
					return;
				}
				shooting.travelled += SHOOTING_SPEED * delta;
				const dx = Math.cos(shooting.angle);
				const dy = Math.sin(shooting.angle);
				const headX = shooting.x + dx * shooting.travelled;
				const headY = shooting.y + dy * shooting.travelled;
				const tail = Math.min(SHOOTING_TAIL, shooting.travelled);
				const gradient = ctx.createLinearGradient(
					headX - dx * tail,
					headY - dy * tail,
					headX,
					headY
				);
				gradient.addColorStop(0, rgba(accent, 0));
				gradient.addColorStop(1, rgba(accent, 0.9));
				ctx.strokeStyle = gradient;
				ctx.lineWidth = 1.5;
				ctx.lineCap = "round";
				ctx.beginPath();
				ctx.moveTo(headX - dx * tail, headY - dy * tail);
				ctx.lineTo(headX, headY);
				ctx.stroke();
				const gone =
					headX < -SHOOTING_TAIL ||
					headX > width + SHOOTING_TAIL ||
					headY > height + SHOOTING_TAIL;
				if (gone) {
					shooting = null;
				}
			},
			resize(nextWidth, nextHeight) {
				width = nextWidth;
				height = nextHeight;
				const count = Math.min(
					MAX_STARS,
					Math.floor(width * height * STAR_DENSITY)
				);
				stars = Array.from({ length: count }, () => ({
					opacity: between(0.35, 0.9),
					phase: Math.random() * TAU,
					radius: between(0.5, 1.25),
					twinkle: Math.random() < 0.7 ? between(1.5, 4) : 0,
					x: Math.random() * width,
					y: Math.random() * height,
				}));
			},
		};
	}, []);

	const canvasRef = useCanvasScene(scene, { redraw: colours, still });

	return <canvas className="fx-canvas fx-stars" ref={canvasRef} />;
}
