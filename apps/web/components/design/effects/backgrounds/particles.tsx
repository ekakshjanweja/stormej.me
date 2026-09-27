"use client";

// adapted from magic ui's particles (magicui.design); pushes away instead of pulling in
import { useEffect, useMemo, useRef } from "react";
import { type CanvasScene, useCanvasScene } from "../use-canvas-scene";
import { isDark, mixRgb, rgba, useThemeColours } from "../use-theme-colours";
import type { BackgroundProps } from "./types";

/** one particle per this many square css pixels */
const AREA_PER_PARTICLE = 9000;
const MAX_PARTICLES = 180;
/** px per second of idle drift */
const DRIFT = 6;
/** how close the cursor has to come before a particle moves out of the way */
const REPEL_RADIUS = 140;
const REPEL_DISTANCE = 60;
/** fraction of the gap to the target offset closed per 60fps frame */
const EASE = 0.08;
const EDGE_FADE = 20;
const TAU = Math.PI * 2;

interface Particle {
	alpha: number;
	dx: number;
	dy: number;
	offsetX: number;
	offsetY: number;
	size: number;
	targetAlpha: number;
	x: number;
	y: number;
}

const between = (min: number, max: number) => min + Math.random() * (max - min);

function spawn(width: number, height: number): Particle {
	return {
		alpha: 0,
		dx: between(-1, 1) * DRIFT,
		dy: between(-1, 1) * DRIFT,
		offsetX: 0,
		offsetY: 0,
		size: between(0.6, 2),
		targetAlpha: between(0.15, 0.7),
		x: Math.random() * width,
		y: Math.random() * height,
	};
}

export function Particles({ still }: BackgroundProps) {
	const colours = useThemeColours();
	const coloursRef = useRef(colours);
	coloursRef.current = colours;
	const pointer = useRef({ x: Number.NaN, y: Number.NaN });

	useEffect(() => {
		const onMove = (event: PointerEvent) => {
			pointer.current = { x: event.clientX, y: event.clientY };
		};
		const onLeave = () => {
			pointer.current = { x: Number.NaN, y: Number.NaN };
		};
		window.addEventListener("pointermove", onMove, { passive: true });
		document.documentElement.addEventListener("pointerleave", onLeave);
		return () => {
			window.removeEventListener("pointermove", onMove);
			document.documentElement.removeEventListener("pointerleave", onLeave);
		};
	}, []);

	const scene = useMemo<CanvasScene>(() => {
		let width = 0;
		let height = 0;
		let particles: Particle[] = [];

		const step = (particle: Particle, delta: number) => {
			particle.x += particle.dx * delta;
			particle.y += particle.dy * delta;
			let targetX = 0;
			let targetY = 0;
			const { x, y } = pointer.current;
			const awayX = particle.x - x;
			const awayY = particle.y - y;
			const distance = Math.hypot(awayX, awayY);
			if (distance > 0 && distance < REPEL_RADIUS) {
				const push = (1 - distance / REPEL_RADIUS) * REPEL_DISTANCE;
				targetX = (awayX / distance) * push;
				targetY = (awayY / distance) * push;
			}
			const ease = 1 - (1 - EASE) ** (delta * 60);
			particle.offsetX += (targetX - particle.offsetX) * ease;
			particle.offsetY += (targetY - particle.offsetY) * ease;
			particle.alpha = Math.min(
				particle.targetAlpha,
				particle.alpha + delta * 0.8
			);
		};

		return {
			// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Particle movement, bounds and painting share the same frame state.
			draw(ctx, _time, delta) {
				const { accent, background, foreground } = coloursRef.current;
				const dim = isDark(background) ? 0.9 : 0.7;
				ctx.clearRect(0, 0, width, height);
				ctx.fillStyle = rgba(mixRgb(foreground, accent, 0.35));
				for (let index = 0; index < particles.length; index += 1) {
					const particle = particles[index];
					if (!particle) {
						continue;
					}
					if (delta > 0) {
						step(particle, delta);
					}
					const x = particle.x + particle.offsetX;
					const y = particle.y + particle.offsetY;
					const outside =
						x < -particle.size ||
						x > width + particle.size ||
						y < -particle.size ||
						y > height + particle.size;
					if (outside) {
						particles[index] = spawn(width, height);
						continue;
					}
					// fade out toward the edges instead of popping off them
					const edge = Math.min(x, width - x, y, height - y);
					const fade = Math.max(0, Math.min(1, edge / EDGE_FADE));
					ctx.globalAlpha =
						(still ? particle.targetAlpha : particle.alpha) * fade * dim;
					ctx.beginPath();
					ctx.arc(x, y, particle.size, 0, TAU);
					ctx.fill();
				}
				ctx.globalAlpha = 1;
			},
			resize(nextWidth, nextHeight) {
				width = nextWidth;
				height = nextHeight;
				const count = Math.min(
					MAX_PARTICLES,
					Math.round((width * height) / AREA_PER_PARTICLE)
				);
				particles = Array.from({ length: count }, () => spawn(width, height));
			},
		};
	}, [still]);

	const canvasRef = useCanvasScene(scene, { redraw: colours, still });

	return <canvas className="fx-canvas fx-particles" ref={canvasRef} />;
}
