"use client";

import { type RefObject, useEffect, useRef } from "react";
import { Fluid, type FluidPalette } from "../_lib/fluid";
import {
	forcedColors,
	gsap,
	isTouch,
	pauseTracker,
	pixelRatio,
	reducedMotion,
} from "../_lib/gsap";
import { drawTextMask } from "../_lib/mask";

/* the dithered fluid behind a card. text in `masks` is redrawn by the
   shader (and its dom copy faded out) only where that's safe: a mouse, no
   reduced motion, no forced colours. otherwise it renders a still frame
   behind the real text */

const FOLLOW = 0.12;
/** the dom text hides a beat after the first gl frame, like the reference */
const HIDE_DELAY = 0.35;
const MAX_DT = 1 / 60;
const AWAY = -1e4;

interface Follower {
	raw: { x: number; y: number };
	smooth: { x: number; y: number };
	started: boolean;
}

/** eases the fluid's pointer toward the mouse and parks the dot on it */
const follow = (
	fluid: Fluid,
	follower: Follower,
	dot: HTMLDivElement | null
) => {
	const rect = fluid.canvas.getBoundingClientRect();
	const { raw, smooth } = follower;
	const tx = raw.x - rect.left;
	const ty = raw.y - rect.top;
	if (follower.started) {
		smooth.x += (tx - smooth.x) * FOLLOW;
		smooth.y += (ty - smooth.y) * FOLLOW;
		fluid.move(smooth.x, smooth.y);
	} else if (raw.x > AWAY) {
		follower.started = true;
		smooth.x = tx;
		smooth.y = ty;
		fluid.place(tx, ty);
	}
	if (!dot) {
		return;
	}
	const inside =
		smooth.x >= 0 &&
		smooth.y >= 0 &&
		smooth.x <= rect.width &&
		smooth.y <= rect.height;
	dot.style.transform = inside
		? `translate3d(${smooth.x}px, ${smooth.y}px, 0)`
		: "translate3d(-100px, -100px, 0)";
};

interface LoopState {
	disposed: boolean;
	paused: boolean;
	visible: boolean;
}

interface FluidCanvasProps {
	className?: string;
	masks?: RefObject<HTMLElement | null>[];
	/** a canvas of coloured shapes the caller redraws every frame */
	overlay?: RefObject<HTMLCanvasElement | null>;
	palette: FluidPalette;
}

const NO_MASKS: RefObject<HTMLElement | null>[] = [];

export function FluidCanvas({
	className,
	masks = NO_MASKS,
	overlay,
	palette,
}: FluidCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const dotRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const fluid = canvas ? Fluid.create(canvas, palette) : null;
		if (!fluid) {
			return;
		}
		const still = reducedMotion() || isTouch();
		const drawsText = !(still || forcedColors());
		fluid.fluidAmount = still ? 0 : 1;

		const state: LoopState = { disposed: false, paused: false, visible: false };
		const follower: Follower = {
			raw: { x: AWAY, y: AWAY },
			smooth: { x: AWAY, y: AWAY },
			started: false,
		};
		let hideCall: gsap.core.Tween | null = null;

		const elements = () =>
			masks
				.map((ref) => ref.current)
				.filter((element): element is HTMLElement => element !== null);

		const refreshMask = () => {
			if (drawsText && !state.disposed) {
				fluid.setMask(drawTextMask(fluid.canvas, elements()));
				fluid.render();
			}
		};

		const onResize = () => {
			if (fluid.resize(pixelRatio())) {
				refreshMask();
			}
			fluid.render();
		};

		const tick = (_time: number, deltaMs: number) => {
			if (!state.visible || state.paused) {
				return;
			}
			follow(fluid, follower, dotRef.current);
			if (overlay?.current) {
				fluid.setOverlay(overlay.current);
			}
			fluid.step(Math.min(deltaMs / 1000, MAX_DT));
		};

		const hideText = () => {
			for (const element of elements()) {
				element.dataset.glText = "hidden";
			}
		};

		const onMove = (event: MouseEvent) => {
			follower.raw.x = event.clientX;
			follower.raw.y = event.clientY;
		};

		fluid.resize(pixelRatio());
		document.fonts.ready.then(() => {
			if (state.disposed) {
				return;
			}
			refreshMask();
			fluid.render();
			if (drawsText) {
				hideCall = gsap.delayedCall(HIDE_DELAY, hideText);
			}
		});

		const resizeObserver = new ResizeObserver(onResize);
		resizeObserver.observe(fluid.canvas);
		/* if the gpu drops the context, give the real text back */
		const onLost = () => {
			state.disposed = true;
			hideCall?.kill();
			gsap.ticker.remove(tick);
			for (const element of elements()) {
				delete element.dataset.glText;
			}
		};
		fluid.canvas.addEventListener("webglcontextlost", onLost);
		/* text that reflows (a font swap, a wider window) moves the mask */
		const textObserver = new ResizeObserver(refreshMask);
		for (const element of elements()) {
			textObserver.observe(element);
		}
		const intersection = new IntersectionObserver(([entry]) => {
			state.visible = entry?.isIntersecting ?? false;
		});
		intersection.observe(fluid.canvas);
		const offPause = pauseTracker((next) => {
			state.paused = next;
		});

		if (!still) {
			window.addEventListener("mousemove", onMove, { passive: true });
			gsap.ticker.add(tick);
		}

		return () => {
			state.disposed = true;
			hideCall?.kill();
			gsap.ticker.remove(tick);
			window.removeEventListener("mousemove", onMove);
			fluid.canvas.removeEventListener("webglcontextlost", onLost);
			resizeObserver.disconnect();
			textObserver.disconnect();
			intersection.disconnect();
			offPause();
			for (const element of elements()) {
				delete element.dataset.glText;
			}
			fluid.destroy();
		};
	}, [masks, overlay, palette]);

	return (
		<div aria-hidden="true" className={`fluid ${className ?? ""}`}>
			<canvas className="fluid-canvas" ref={canvasRef} />
			<div className="fluid-dot" ref={dotRef} />
		</div>
	);
}
