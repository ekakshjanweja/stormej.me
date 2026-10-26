"use client";

import { useEffect, useRef } from "react";
import { TRAIL_IMAGES } from "../_lib/content";
import { gsap, pauseTracker, pixelRatio, reducedMotion } from "../_lib/gsap";

/* move across the card and screenshots fall out of the cursor: each one
   pops in from 1.5x inside a growing rounded clip, drifts on half the
   cursor's speed, then shrinks and fades into the card. leave it alone for
   five seconds and an invisible hand draws a lissajous curve instead */

const SPAWN_RATIO = 0.13;
const FRICTION = 0.94;
const IDLE_AFTER = 5000;
const IDLE_EVERY = 0.5;
const RECENT = 6;
const RADIUS = 8;
const CARD = "#ebede7";

interface Sprite {
	clip: number;
	fade: number;
	image: HTMLImageElement;
	scale: number;
	timeline: gsap.core.Timeline;
	vx: number;
	vy: number;
	x: number;
	y: number;
}

const loadImages = () =>
	TRAIL_IMAGES.map((src) => {
		const image = new Image();
		image.decoding = "async";
		image.src = src;
		return image;
	});

const drawSprite = (
	context: CanvasRenderingContext2D,
	sprite: Sprite,
	size: number
) => {
	const { image } = sprite;
	if (!image.complete || image.naturalWidth === 0 || sprite.clip <= 0) {
		return;
	}
	const aspect = image.naturalHeight / image.naturalWidth;
	const width = aspect >= 1 ? size : size / aspect / 1.4;
	const height = width * aspect;
	context.save();
	context.translate(sprite.x, sprite.y);
	context.scale(sprite.scale, sprite.scale);
	const clipW = width * sprite.clip;
	const clipH = height * sprite.clip;
	context.beginPath();
	context.roundRect(-clipW / 2, -clipH / 2, clipW, clipH, RADIUS);
	context.clip();
	context.drawImage(image, -width / 2, -height / 2, width, height);
	if (sprite.fade > 0) {
		context.globalAlpha = sprite.fade;
		context.fillStyle = CARD;
		context.fillRect(-width / 2, -height / 2, width, height);
	}
	context.restore();
};

class TrailScene {
	readonly canvas: HTMLCanvasElement;
	readonly context: CanvasRenderingContext2D;
	readonly images = loadImages();
	readonly sprites: Sprite[] = [];
	readonly recent: number[] = [];
	readonly pointer = { vx: 0, vy: 0, x: 0, y: 0 };
	last = { x: Number.NaN, y: Number.NaN };
	/* start idle, so the card is alive before anyone touches it */
	lastMove = performance.now() - IDLE_AFTER;
	idleClock = 0;
	idleTime = 0;
	width = 0;
	height = 0;

	constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		this.canvas = canvas;
		this.context = context;
	}

	get size() {
		return Math.hypot(this.width, this.height) * SPAWN_RATIO;
	}

	resize() {
		const ratio = pixelRatio();
		this.width = this.canvas.clientWidth;
		this.height = this.canvas.clientHeight;
		this.canvas.width = Math.floor(this.width * ratio);
		this.canvas.height = Math.floor(this.height * ratio);
		this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
	}

	pickImage() {
		const { images, recent } = this;
		let index = Math.floor(Math.random() * images.length);
		for (let tries = 0; tries < 10 && recent.includes(index); tries += 1) {
			index = Math.floor(Math.random() * images.length);
		}
		recent.push(index);
		if (recent.length > RECENT) {
			recent.shift();
		}
		return images[index];
	}

	remove(sprite: Sprite) {
		const index = this.sprites.indexOf(sprite);
		if (index >= 0) {
			this.sprites.splice(index, 1);
		}
	}

	spawn(x: number, y: number, slow: boolean) {
		const image = this.pickImage();
		if (!image) {
			return;
		}
		const sprite: Sprite = {
			clip: 0,
			fade: 0,
			image,
			scale: 1.5,
			timeline: gsap.timeline(),
			vx: slow ? 0 : this.pointer.vx * 0.5,
			vy: slow ? 0 : this.pointer.vy * 0.5,
			x,
			y,
		};
		const grow = slow ? 2.5 : 1.1;
		const open = slow ? 1.5 : 0.75;
		const leave = slow ? 3.3 : 1;
		sprite.timeline
			.to(sprite, { duration: grow, ease: "power3.out", scale: 1 }, 0)
			.to(sprite, { clip: 1, duration: open, ease: "expo.out" }, 0)
			.to(
				sprite,
				{ clip: 0, duration: 0.5, ease: "power3.in", scale: 0.5 },
				leave
			)
			.to(sprite, { duration: 0.5, ease: "power1.in", fade: 1 }, leave)
			.call(() => this.remove(sprite));
		sprite.timeline.data = slow ? "idle" : "live";
		this.sprites.push(sprite);
	}

	/** idle images get out of the way fast once someone moves */
	quickExit() {
		for (const sprite of this.sprites) {
			if (sprite.timeline.data !== "idle") {
				continue;
			}
			sprite.timeline.kill();
			sprite.timeline.data = "leaving";
			gsap.to(sprite, {
				clip: 0,
				duration: 0.35,
				ease: "power3.in",
				onComplete: () => this.remove(sprite),
				scale: 0.5,
			});
		}
	}

	draw() {
		this.context.clearRect(0, 0, this.width, this.height);
		const { size } = this;
		for (const sprite of this.sprites) {
			drawSprite(this.context, sprite, size);
		}
	}

	idleStep(dt: number) {
		this.idleTime += dt;
		this.idleClock += dt;
		if (this.idleClock < IDLE_EVERY) {
			return;
		}
		this.idleClock = 0;
		const t = this.idleTime;
		const x = this.width / 2 + Math.sin(t * 0.9) * this.width * 0.34;
		const y = this.height / 2 + Math.sin(t * 1.3 + 0.6) * this.height * 0.3;
		this.spawn(x, y, true);
	}

	step(dt: number) {
		if (performance.now() - this.lastMove > IDLE_AFTER) {
			this.idleStep(dt);
		}
		for (const sprite of this.sprites) {
			sprite.x += sprite.vx * dt * 60;
			sprite.y += sprite.vy * dt * 60;
			sprite.vx *= FRICTION;
			sprite.vy *= FRICTION;
		}
		this.draw();
	}

	move(clientX: number, clientY: number) {
		const rect = this.canvas.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;
		const { pointer } = this;
		pointer.vx = pointer.vx * 0.8 + (x - pointer.x) * 0.2;
		pointer.vy = pointer.vy * 0.8 + (y - pointer.y) * 0.2;
		pointer.x = x;
		pointer.y = y;
		if (performance.now() - this.lastMove > IDLE_AFTER) {
			this.quickExit();
			this.idleClock = 0;
		}
		this.lastMove = performance.now();
		const distance = Math.hypot(x - this.last.x, y - this.last.y);
		if (Number.isNaN(distance) || distance > this.size / 2) {
			this.last = { x, y };
			this.spawn(x, y, false);
		}
	}

	/** a still for reduced motion: three screenshots laid down once */
	still() {
		const picks = this.images.slice(0, 3);
		for (const [index, image] of picks.entries()) {
			image.addEventListener("load", () => {
				this.sprites.push({
					clip: 1,
					fade: 0,
					image,
					scale: 1,
					timeline: gsap.timeline(),
					vx: 0,
					vy: 0,
					x: this.width * (0.3 + index * 0.2),
					y: this.height * (0.5 + (index - 1) * 0.08),
				});
				this.draw();
			});
		}
	}

	destroy() {
		for (const sprite of this.sprites) {
			sprite.timeline.kill();
		}
		gsap.killTweensOf(this.sprites);
	}
}

export function ImageTrail() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (!(canvas && context)) {
			return;
		}
		const scene = new TrailScene(canvas, context);
		scene.resize();
		const resizeObserver = new ResizeObserver(() => {
			scene.resize();
			scene.draw();
		});
		resizeObserver.observe(canvas);

		if (reducedMotion()) {
			scene.still();
			return () => resizeObserver.disconnect();
		}

		const state: { paused: boolean; visible: boolean } = {
			paused: false,
			visible: false,
		};
		const tick = (_time: number, deltaMs: number) => {
			if (state.visible && !state.paused) {
				scene.step(Math.min(deltaMs / 1000, 0.05));
			}
		};
		const onMove = (event: PointerEvent) =>
			scene.move(event.clientX, event.clientY);
		const intersection = new IntersectionObserver(([entry]) => {
			state.visible = entry?.isIntersecting ?? false;
		});
		intersection.observe(canvas);
		const offPause = pauseTracker((next) => {
			state.paused = next;
		});
		canvas.addEventListener("pointermove", onMove);
		gsap.ticker.add(tick);

		return () => {
			gsap.ticker.remove(tick);
			canvas.removeEventListener("pointermove", onMove);
			resizeObserver.disconnect();
			intersection.disconnect();
			offPause();
			scene.destroy();
		};
	}, []);

	return (
		<div aria-hidden="true" className="trail">
			<canvas className="trail-canvas" ref={canvasRef} />
		</div>
	);
}
