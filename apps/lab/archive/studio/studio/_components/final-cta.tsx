"use client";

import { useEffect, useRef } from "react";
import { LINKS } from "@/lib/profile";
import { CTA } from "../_lib/content";
import { PAPER_PALETTE } from "../_lib/fluid";
import { gsap, isTouch, pauseTracker, reducedMotion } from "../_lib/gsap";
import { wordBoxes } from "../_lib/mask";
import { NEW_TAB } from "./external-link";
import { FluidCanvas } from "./fluid-canvas";
import { MainButtonLabel } from "./main-button";

/* the last card. a sage block is thrown in from the left, falls, bounces
   off the floor and off the words of the title, and leaves a trail of
   tinted blocks behind it. it's drawn into a canvas the fluid treats as
   cards, so stirring the fluid dithers them too */

const GRAVITY = 0.45;
const RESTITUTION = 0.72;
const MIN_BOUNCE = 10;
const TRAIL_EVERY = 0.05;
const RESPAWN_AFTER = 0.75;
/* the trail cycles a sage ramp; the block itself is the darkest */
const RAMP = ["#3d6a4c", "#6f9479", "#a6c6ae", "#b3cfba", "#c5dacb"];
const BLOCK = "#3d6a4c";

interface Rect {
	h: number;
	w: number;
	x: number;
	y: number;
}

interface TrailBlock extends Rect {
	color: string;
	scale: number;
}

const blockSize = () => {
	const width = window.innerWidth;
	if (width <= 767) {
		return { h: 107, w: 80 };
	}
	if (width <= 987) {
		return { h: 133, w: 100 };
	}
	return { h: 160, w: 120 };
};

const overlaps = (a: Rect, b: Rect) =>
	a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** pushes the block out of `wall` along the shallower axis and bounces */
const collide = (block: Rect & { vx: number; vy: number }, wall: Rect) => {
	const fromLeft = block.x + block.w - wall.x;
	const fromRight = wall.x + wall.w - block.x;
	const fromTop = block.y + block.h - wall.y;
	const fromBottom = wall.y + wall.h - block.y;
	const pushX = Math.min(fromLeft, fromRight);
	const pushY = Math.min(fromTop, fromBottom);
	if (pushX < pushY) {
		block.x += fromLeft < fromRight ? -fromLeft : fromRight;
		block.vx = -block.vx * RESTITUTION;
	} else {
		block.y += fromTop < fromBottom ? -fromTop : fromBottom;
		block.vy = -block.vy * RESTITUTION;
	}
};

const startBouncer = (
	canvas: HTMLCanvasElement,
	title: HTMLElement,
	animate: boolean
) => {
	const context = canvas.getContext("2d");
	if (!context) {
		return () => undefined;
	}
	let width = 0;
	let height = 0;
	let words: Rect[] = [];
	let size = blockSize();
	const block = { h: 0, vx: 0, vy: 0, w: 0, x: 0, y: 0 };
	const trail: TrailBlock[] = [];
	let trailClock = 0;
	let colorIndex = 0;
	let flying = false;
	let visible = false;
	let paused = false;

	const measure = () => {
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		canvas.width = width;
		canvas.height = height;
		size = blockSize();
		const bounds = canvas.getBoundingClientRect();
		words = wordBoxes(title).map((box) => ({
			h: box.height,
			w: box.width,
			x: box.left - bounds.left,
			y: box.top - bounds.top,
		}));
	};

	const launch = () => {
		block.w = size.w;
		block.h = size.h;
		block.x = -size.w;
		block.y = height * (0.1 + Math.random() * 0.25);
		block.vx = 5 + Math.random() * 3;
		block.vy = -(4 + Math.random() * 4);
		flying = true;
	};

	const draw = () => {
		/* transparent reads as black to the shader, and as nothing on screen */
		context.clearRect(0, 0, width, height);
		for (const piece of trail) {
			const w = piece.w * piece.scale;
			const h = piece.h * piece.scale;
			context.fillStyle = piece.color;
			context.beginPath();
			context.roundRect(
				piece.x + (piece.w - w) / 2,
				piece.y + (piece.h - h) / 2,
				w,
				h,
				12
			);
			context.fill();
		}
		if (flying || !animate) {
			context.fillStyle = BLOCK;
			context.beginPath();
			context.roundRect(block.x, block.y, block.w, block.h, 12);
			context.fill();
		}
	};

	const leave = () => {
		flying = false;
		const pieces = [...trail];
		gsap.to(pieces, {
			duration: 0.15,
			ease: "power3.in",
			onComplete: () => {
				trail.length = 0;
				gsap.delayedCall(RESPAWN_AFTER, launch);
			},
			scale: 0,
			stagger: 0.035,
		});
	};

	const step = (dt: number) => {
		const frames = dt * 60;
		block.vy += GRAVITY * frames;
		block.x += block.vx * frames;
		block.y += block.vy * frames;
		const floor = height - block.h;
		if (block.y > floor) {
			block.y = floor;
			block.vy = -Math.max(Math.abs(block.vy) * RESTITUTION, MIN_BOUNCE);
		}
		for (const word of words) {
			if (overlaps(block, word)) {
				collide(block, word);
			}
		}
		/* never drift backwards off the left edge */
		block.vx = Math.max(Math.abs(block.vx), 3);
		trailClock += dt;
		if (trailClock >= TRAIL_EVERY) {
			trailClock = 0;
			colorIndex = (colorIndex + 1) % RAMP.length;
			trail.push({
				color: RAMP[colorIndex],
				h: block.h,
				scale: 1,
				w: block.w,
				x: block.x,
				y: block.y,
			});
		}
		if (block.x > width + block.w) {
			leave();
		}
	};

	const tick = (_time: number, deltaMs: number) => {
		if (!visible || paused) {
			return;
		}
		if (flying) {
			step(Math.min(deltaMs / 1000, 1 / 30));
		}
		draw();
	};

	measure();
	const resizeObserver = new ResizeObserver(() => {
		measure();
		if (!animate) {
			block.w = size.w;
			block.h = size.h;
			block.x = width * 0.08;
			block.y = height - size.h;
			draw();
		}
	});
	resizeObserver.observe(canvas);
	const textObserver = new ResizeObserver(measure);
	textObserver.observe(title);

	if (!animate) {
		return () => {
			resizeObserver.disconnect();
			textObserver.disconnect();
		};
	}

	const intersection = new IntersectionObserver(([entry]) => {
		visible = entry?.isIntersecting ?? false;
	});
	intersection.observe(canvas);
	const offPause = pauseTracker((next) => {
		paused = next;
	});
	launch();
	gsap.ticker.add(tick);
	return () => {
		gsap.ticker.remove(tick);
		resizeObserver.disconnect();
		textObserver.disconnect();
		intersection.disconnect();
		offPause();
		gsap.killTweensOf(trail);
	};
};

export function FinalCta() {
	const sectionRef = useRef<HTMLElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);
	const overlayRef = useRef<HTMLCanvasElement>(null);
	const masks = useRef([titleRef]).current;

	useEffect(() => {
		const section = sectionRef.current;
		const title = titleRef.current;
		const overlay = overlayRef.current;
		if (!(section && title && overlay)) {
			return;
		}
		const still = reducedMotion();
		/* without the gl pass (touch, reduced motion) the blocks show as is */
		section.dataset.overlay = still || isTouch() ? "visible" : "gl";
		const stop = startBouncer(overlay, title, !still);
		if (still) {
			return stop;
		}
		const context = gsap.context(() => {
			gsap.fromTo(
				[".cta-inner", ".cta-layers"],
				{ y: () => -window.innerHeight * 0.25 },
				{
					ease: "none",
					scrollTrigger: {
						end: "top top",
						invalidateOnRefresh: true,
						scrub: 0,
						start: "top bottom",
						trigger: section,
					},
					y: 0,
				}
			);
		}, section);
		return () => {
			stop();
			context.revert();
		};
	}, []);

	return (
		<section aria-labelledby="cta-title" className="cta" ref={sectionRef}>
			<div className="cta-layers">
				<FluidCanvas
					masks={masks}
					overlay={overlayRef}
					palette={PAPER_PALETTE}
				/>
				<div aria-hidden="true" className="cta-overlay">
					<canvas ref={overlayRef} />
				</div>
			</div>
			<div className="cta-inner">
				<h2 className="cta-title" id="cta-title" ref={titleRef}>
					{CTA.title}
				</h2>
				<a
					aria-label={`${CTA.button} on cal.com (${NEW_TAB})`}
					className="btn-main btn-main-primary btn-main-lg"
					href={LINKS.cal}
					rel="noopener noreferrer"
					target="_blank"
				>
					<MainButtonLabel>{CTA.button}</MainButtonLabel>
				</a>
			</div>
		</section>
	);
}
