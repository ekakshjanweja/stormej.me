"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { pageIntro } from "@/components/curtain/page-intro";
import { COVER, type LoaderProps } from "./types";

gsap.registerPlugin(useGSAP);

const SKY = "#0a0c0a";
const SKY_RGB = "10, 12, 10";
const PALETTE = ["#8fc09d", "#3d6a4c", "#e7ebe6", "#c8ecd2", "#5f8f6c"];
const WORD = "stormej";
/** how far the formation is staggered across particles (0–1 of the tween) */
const SPREAD = 0.4;

interface Particle {
	angle: number;
	blastX: number;
	blastY: number;
	colour: number;
	delay: number;
	radius: number;
	size: number;
	speed: number;
	tx: number;
	ty: number;
}

const inOut = gsap.parseEase("power3.inOut");

/** the word as a cloud of points, read off an offscreen canvas */
const serif = () =>
	getComputedStyle(document.documentElement)
		.getPropertyValue("--font-instrument-serif")
		.trim() || "serif";

function wordPoints(vw: number, vh: number, count: number) {
	const canvas = document.createElement("canvas");
	canvas.width = vw;
	canvas.height = vh;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) {
		return [];
	}
	const size = Math.min(vw * 0.24, vh * 0.42);
	ctx.font = `italic 400 ${size}px ${serif()}`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(WORD, vw / 2, vh / 2);
	const { data } = ctx.getImageData(0, 0, vw, vh);
	const step = Math.max(2, Math.round(size / 70));
	const points: [number, number][] = [];
	for (let y = 0; y < vh; y += step) {
		for (let x = 0; x < vw; x += step) {
			if ((data[(y * vw + x) * 4 + 3] ?? 0) > 128) {
				points.push([x, y]);
			}
		}
	}
	return gsap.utils.shuffle(points).slice(0, count);
}

/** a jagged bolt by midpoint displacement */
function bolt(x0: number, y0: number, x1: number, y1: number, spread: number) {
	let points: [number, number][] = [
		[x0, y0],
		[x1, y1],
	];
	let offset = spread;
	for (let pass = 0; pass < 7; pass += 1) {
		const next: [number, number][] = [];
		for (let i = 0; i < points.length - 1; i += 1) {
			const [ax, ay] = points[i] ?? [0, 0];
			const [bx, by] = points[i + 1] ?? [0, 0];
			next.push(
				[ax, ay],
				[(ax + bx) / 2 + gsap.utils.random(-offset, offset), (ay + by) / 2]
			);
		}
		next.push(points.at(-1) ?? [x1, y1]);
		points = next;
		offset /= 2;
	}
	return points;
}

/**
 * A storm, because stormej: a few thousand specks spin up into a cyclone,
 * lightning cracks across it, the cyclone condenses into the word, and the
 * word detonates outwards off the page.
 */
export function Storm({ onDone }: LoaderProps) {
	const root = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useGSAP(
		() => {
			const canvas = canvasRef.current;
			const ctx = canvas?.getContext("2d");
			if (!(canvas && ctx)) {
				return;
			}
			const q = gsap.utils.selector(root);
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = vw * dpr;
			canvas.height = vh * dpr;
			ctx.scale(dpr, dpr);

			const cx = vw / 2;
			const cy = vh / 2;
			const reach = Math.hypot(vw, vh) / 2;
			const count = Math.round(gsap.utils.clamp(900, 2600, (vw * vh) / 420));
			const state = { blast: 0, form: 0, pull: 0, ring: 0, spin: 0 };
			const strikes: [number, number][][] = [];

			const particles: Particle[] = Array.from({ length: count }, () => {
				const radius = reach * (0.04 + 0.9 * Math.sqrt(Math.random()));
				const out = Math.random() * Math.PI * 2;
				return {
					angle: Math.random() * Math.PI * 2,
					blastX: Math.cos(out),
					blastY: Math.sin(out),
					colour: gsap.utils.random(0, PALETTE.length - 1, 1),
					delay: Math.random() * SPREAD,
					radius,
					size: gsap.utils.random(0.8, 2.4),
					speed: 0.5 + 2.6 / (radius / reach + 0.12),
					tx: cx,
					ty: cy,
				};
			});
			/* draw in colour batches: one fillStyle per colour per frame */
			particles.sort((a, b) => a.colour - b.colour);

			const aim = () => {
				const points = wordPoints(vw, vh, count);
				if (points.length === 0) {
					return;
				}
				for (const [i, p] of particles.entries()) {
					const [x, y] = points[i % points.length] ?? [cx, cy];
					p.tx = x + gsap.utils.random(-1, 1);
					p.ty = y + gsap.utils.random(-1, 1);
				}
			};

			const strike = () => {
				const x = gsap.utils.random(vw * 0.15, vw * 0.85);
				strikes.push(
					bolt(
						x,
						-10,
						cx + gsap.utils.random(-vw * 0.2, vw * 0.2),
						cy + gsap.utils.random(-40, 120),
						vw * 0.12
					)
				);
			};

			const draw = (_time: number, deltaMs: number) => {
				const dt = Math.min(deltaMs, 50) / 1000;
				if (state.blast > 0) {
					ctx.clearRect(0, 0, vw, vh);
				} else {
					ctx.fillStyle = `rgba(${SKY_RGB}, 0.2)`;
					ctx.fillRect(0, 0, vw, vh);
				}

				for (const path of strikes.splice(0)) {
					ctx.save();
					ctx.strokeStyle = "#f4fff7";
					ctx.shadowColor = "#8fc09d";
					ctx.shadowBlur = 24;
					ctx.lineWidth = 2.2;
					ctx.beginPath();
					for (const [i, [x, y]] of path.entries()) {
						if (i === 0) {
							ctx.moveTo(x, y);
						} else {
							ctx.lineTo(x, y);
						}
					}
					ctx.stroke();
					ctx.restore();
				}

				const squash = 1 - 0.45 * state.pull;
				const blastReach = state.blast ** 1.7 * reach * 1.6;
				let batch = -1;
				for (const [i, p] of particles.entries()) {
					p.angle += p.speed * state.spin * dt;
					const vx = cx + Math.cos(p.angle) * p.radius * squash;
					const vy = cy + Math.sin(p.angle) * p.radius * squash * 0.62;
					const f = inOut(
						gsap.utils.clamp(0, 1, (state.form - p.delay) / (1 - SPREAD))
					);
					const shimmer = f * Math.sin(_time * 9 + i) * 0.6;
					const x =
						vx + (p.tx - vx) * f + p.blastX * blastReach * (0.6 + p.delay);
					const y =
						vy +
						(p.ty - vy) * f +
						p.blastY * blastReach * (0.6 + p.delay) +
						shimmer;
					if (p.colour !== batch) {
						batch = p.colour;
						ctx.fillStyle = PALETTE[batch] ?? "#fff";
					}
					ctx.fillRect(x, y, p.size, p.size);
				}

				if (state.ring > 0 && state.ring < 1) {
					ctx.save();
					ctx.strokeStyle = `rgba(231, 235, 230, ${1 - state.ring})`;
					ctx.lineWidth = 3 + 30 * (1 - state.ring);
					ctx.beginPath();
					ctx.arc(cx, cy, state.ring * reach * 1.2, 0, Math.PI * 2);
					ctx.stroke();
					ctx.restore();
				}
			};

			/* the italic cut isn't on the page yet; fetch it before the word forms */
			document.fonts.load(`italic 400 100px ${serif()}`).catch(() => undefined);
			ctx.fillStyle = SKY;
			ctx.fillRect(0, 0, vw, vh);
			gsap.ticker.add(draw);

			const tl = gsap.timeline({ onComplete: onDone });
			const flash = q("[data-flash]");
			const shake = (strength: number) =>
				gsap.fromTo(
					canvas,
					{
						x: gsap.utils.random(-strength, strength),
						y: gsap.utils.random(-strength, strength),
					},
					{ duration: 0.4, ease: "elastic.out(1, 0.3)", x: 0, y: 0 }
				);
			const thunder = (at: number, strength: number) => {
				tl.call(strike, [], at)
					.fromTo(
						flash,
						{ opacity: 0.55 * strength },
						{ duration: 0.35, ease: "power2.out", opacity: 0 },
						at
					)
					.add(shake(14 * strength), at);
			};

			tl.to(state, { duration: 1.8, ease: "power2.in", spin: 1.6 }, 0)
				.from(
					q("[data-caption]"),
					{ duration: 0.8, ease: "expo.out", opacity: 0, y: 12 },
					0.2
				)
				.to(
					q("[data-pressure]"),
					{
						duration: 2.2,
						ease: "power1.in",
						innerText: 941,
						snap: { innerText: 1 },
					},
					0.2
				);
			thunder(0.85, 0.7);
			thunder(1.3, 1);
			thunder(1.55, 0.8);
			tl.to(state, { duration: 0.6, ease: "power2.inOut", pull: 1 }, 1.6)
				.call(aim, [], 1.9)
				.to(state, { duration: 1.4, ease: "none", form: 1 }, 1.95)
				.to(state, { duration: 1.2, ease: "power2.out", spin: 0.2 }, 2.2)
				.to(q("[data-caption]"), { duration: 0.4, opacity: 0 }, 3.0);
			thunder(3.15, 0.5);
			/* detonate */
			tl.set(root.current, { pointerEvents: "none" }, 3.55)
				.fromTo(
					flash,
					{ opacity: 0.9 },
					{ duration: 0.5, ease: "power2.out", opacity: 0 },
					3.55
				)
				.to(
					q("[data-sky]"),
					{ duration: 0.5, ease: "power2.out", opacity: 0 },
					3.55
				)
				.to(state, { blast: 1, duration: 1.1, ease: "power2.in" }, 3.55)
				.to(state, { duration: 0.7, ease: "power2.out", ring: 1 }, 3.55)
				.add(shake(26), 3.55)
				.add(pageIntro(), 3.7);

			return () => gsap.ticker.remove(draw);
		},
		{ scope: root }
	);

	return (
		<div aria-hidden className={COVER} ref={root}>
			<div className="absolute inset-0" data-sky style={{ background: SKY }} />
			<canvas className="absolute inset-0 size-full" ref={canvasRef} />
			<div
				className="absolute inset-0 bg-[#f4fff7] opacity-0 mix-blend-screen"
				data-flash
			/>
			<p
				className="absolute bottom-6 left-6 font-mono text-[#8fc09d] text-[11px] uppercase tracking-[0.2em]"
				data-caption
			>
				stormej.me · pressure <span data-pressure>1013</span> hpa
			</p>
		</div>
	);
}
