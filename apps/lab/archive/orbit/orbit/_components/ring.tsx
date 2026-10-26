"use client";

import Image from "next/image";
import Link from "next/link";
import {
	type FocusEvent,
	type KeyboardEvent,
	type MouseEvent,
	type PointerEvent,
	useCallback,
	useEffect,
	useRef,
} from "react";
import { clamp, damp, easeOutExpo, lerp, wrapAngle } from "@/lib/motion";
import { playSfx } from "@/lib/sfx";
import { type Card, isExternal, toneFor, type WorldId } from "../_lib/content";

/* the camera stands in the middle of a round room and the cards hang on
   its wall. only the room turns: one transform per frame, the cards
   themselves sit still once the entrance is done */

const CARD_W = 270;
const CARD_H = 480;
const GAP = 64;
/** the front card's share of the wall, by height and by width */
const FRONT_CARD_HEIGHT = 0.5;
const FRONT_CARD_WIDTH = 0.46;
/** perspective as a share of the radius; it sets the front card's scale */
const MIN_LENS = 0.32;
const MAX_LENS = 0.82;
/** the circle that fits every card plus its gap. rounded, because it is
   rendered on the server too and Math.tan may differ in the last digit */
const radiusFor = (count: number) =>
	Math.round(((CARD_W + GAP) / (2 * Math.tan(Math.PI / count))) * 100) / 100;

/** deg per px of drag */
const DRAG_GAIN = 0.11;
const SCROLL_CUE_TRAVEL = 80;
/** deg per second added per px of wheel */
const WHEEL_GAIN = 0.35;
const MAX_SPIN = 240;
/** how fast a fling dies, per second */
const FRICTION = 2.4;
/** idle drift, deg per second */
const DRIFT = 2.2;
/** how fast a focused card swings to the front, per second */
const SEEK = 7;
/** past this many px a press is a drag, not a click */
const DRAG_SLOP = 6;
/** holding still this long before letting go means no fling */
const FLING_WINDOW_MS = 80;
/** past this angle a card is off-screen or behind the camera */
const BEHIND = 80;

const INTRO_MS = 2400;
/** each card waits this long per step away from the front */
const INTRO_STAGGER_MS = 70;
const INTRO_CARD_MS = 1500;
/** where the cards start: far off and blown up, a dolly zoom in */
const INTRO_DEPTH = 2.4;
const INTRO_SCALE = 2.3;
const INTRO_SPIN = -64;
const INTRO_TILT = 14;

interface Spin {
	dragDistance: number;
	dragging: boolean;
	hovering: boolean;
	lastT: number;
	lastX: number;
	/** perspective in px: the camera's distance to the room's middle */
	lens: number;
	pointerId: number;
	rotation: number;
	/** a card asked to come to the front (keyboard focus) */
	target: number | null;
	velocity: number;
}

/** one frame of the settled ring: seek a focused card, or coast and drift */
const coast = (spin: Spin, dt: number, still: boolean) => {
	if (spin.dragging) {
		return;
	}
	if (spin.target !== null) {
		const gap = wrapAngle(spin.target - spin.rotation);
		spin.rotation += gap - damp(gap, 0, still ? 60 : SEEK, dt);
		spin.velocity = 0;
		if (Math.abs(gap) < 0.05) {
			spin.target = null;
		}
		return;
	}
	spin.rotation += spin.velocity * dt;
	const drift = still || spin.hovering ? 0 : DRIFT;
	/* a fling slows down into the idle drift instead of stopping dead */
	spin.velocity = damp(spin.velocity, drift, still ? 30 : FRICTION, dt);
};

const cardTransform = (
	index: number,
	step: number,
	radius: number,
	depth: number,
	scale: number
) =>
	`rotateY(${index * step}deg) translateZ(${-radius * depth}px) scale(${scale})`;

interface RingProps {
	cards: Card[];
	focus: WorldId | null;
	/** jump straight to the settled ring, no entrance */
	immediate: boolean;
	/** start the entrance */
	playing: boolean;
	reducedMotion: boolean;
}

export function Ring({
	cards,
	focus,
	immediate,
	playing,
	reducedMotion,
}: RingProps) {
	const wallRef = useRef<HTMLElement>(null);
	const lensRef = useRef<HTMLDivElement>(null);
	const centerRef = useRef<HTMLDivElement>(null);

	const count = cards.length;
	const step = 360 / count;
	const radius = radiusFor(count);

	/* everything the frame loop reads lives here, not in state: a drag at
	   120fps must not re-render react */
	const spin = useRef<Spin>({
		dragDistance: 0,
		dragging: false,
		hovering: false,
		lastT: 0,
		lastX: 0,
		lens: 600,
		pointerId: -1,
		rotation: 0,
		target: null,
		velocity: 0,
	});
	const settings = useRef({ immediate, playing, reducedMotion });
	settings.current = { immediate, playing, reducedMotion };

	const cardEls = useCallback(
		() =>
			Array.from(
				centerRef.current?.querySelectorAll<HTMLAnchorElement>(".card") ?? []
			),
		[]
	);

	useEffect(() => {
		const center = centerRef.current;
		if (!center) {
			return;
		}
		const els = cardEls();
		const state = spin.current;
		const behind = new Array<boolean>(count).fill(false);
		let introStart = -1;
		let introDone = false;
		let frame = 0;
		let last = performance.now();

		const settleCards = () => {
			for (const [index, el] of els.entries()) {
				el.style.transform = cardTransform(index, step, radius, 1, 1);
				el.style.opacity = "";
			}
			introDone = true;
		};

		/* the front card lands first, the rest follow round both sides.
		   returns the room's tilt for this frame */
		const intro = (elapsed: number) => {
			for (const [index, el] of els.entries()) {
				const away = Math.abs(wrapAngle(index * step)) / step;
				const local = clamp(
					(elapsed - away * INTRO_STAGGER_MS) / INTRO_CARD_MS,
					0,
					1
				);
				const eased = easeOutExpo(local);
				el.style.transform = cardTransform(
					index,
					step,
					radius,
					lerp(INTRO_DEPTH, 1, eased),
					lerp(INTRO_SCALE, 1, eased)
				);
				el.style.opacity = String(clamp(local * 2.2, 0, 1));
			}
			const p = easeOutExpo(clamp(elapsed / INTRO_MS, 0, 1));
			state.rotation = lerp(INTRO_SPIN, 0, p);
			if (elapsed >= INTRO_MS + count * INTRO_STAGGER_MS) {
				settleCards();
			}
			return lerp(INTRO_TILT, 0, p);
		};

		/* hide what is behind the camera; only touches the dom on change */
		const cull = () => {
			for (const [index, el] of els.entries()) {
				const isBehind =
					Math.abs(wrapAngle(index * step + state.rotation)) > BEHIND;
				if (isBehind !== behind[index]) {
					behind[index] = isBehind;
					el.toggleAttribute("data-behind", isBehind);
				}
			}
		};

		const advance = (now: number, dt: number) => {
			const {
				immediate: skip,
				playing: go,
				reducedMotion: still,
			} = settings.current;
			if (introDone) {
				coast(state, dt, still);
				return 0;
			}
			if (skip || still) {
				state.rotation = 0;
				settleCards();
				return 0;
			}
			if (!go) {
				return 0;
			}
			if (introStart < 0) {
				introStart = now;
			}
			return intro(now - introStart);
		};

		const tick = (now: number) => {
			const dt = Math.min(now - last, 64) / 1000;
			last = now;
			const tilt = advance(now, dt);
			/* lift the room so the camera sits at its middle, then turn it */
			center.style.transform = `translateZ(${state.lens}px) rotateX(${tilt}deg) rotateY(${state.rotation}deg)`;
			cull();
			frame = requestAnimationFrame(tick);
		};

		/* size the lens to the wall: the front card ends up about half the
		   wall's height, and never wider than about half a narrow screen */
		const fit = () => {
			const wall = wallRef.current;
			const lens = lensRef.current;
			if (!(wall && lens)) {
				return;
			}
			const { width, height } = wall.getBoundingClientRect();
			const scale = Math.min(
				(height * FRONT_CARD_HEIGHT) / CARD_H,
				(width * FRONT_CARD_WIDTH) / CARD_W
			);
			state.lens = radius * clamp(scale, MIN_LENS, MAX_LENS);
			lens.style.perspective = `${state.lens}px`;
		};
		fit();
		const observer = new ResizeObserver(fit);
		if (wallRef.current) {
			observer.observe(wallRef.current);
		}

		frame = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [cardEls, count, radius, step]);

	/* wheel spins the room; the page itself never scrolls */
	useEffect(() => {
		const wall = wallRef.current;
		if (!wall) {
			return;
		}
		let scrollTravel = 0;
		const onWheel = async (event: WheelEvent) => {
			const state = spin.current;
			const delta =
				Math.abs(event.deltaX) > Math.abs(event.deltaY)
					? event.deltaX
					: event.deltaY;
			state.target = null;
			state.velocity = clamp(
				state.velocity + delta * WHEEL_GAIN,
				-MAX_SPIN,
				MAX_SPIN
			);
			scrollTravel += Math.abs(delta);
			if (
				scrollTravel >= SCROLL_CUE_TRAVEL &&
				!settings.current.reducedMotion
			) {
				scrollTravel = 0;
				await playSfx("scroll");
			}
		};
		wall.addEventListener("wheel", onWheel, { passive: true });
		return () => wall.removeEventListener("wheel", onWheel);
	}, []);

	const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
		if (event.button !== 0) {
			return;
		}
		const state = spin.current;
		state.dragging = true;
		state.pointerId = event.pointerId;
		state.lastX = event.clientX;
		state.lastT = event.timeStamp;
		state.dragDistance = 0;
		state.velocity = 0;
		state.target = null;
		event.currentTarget.setAttribute("data-dragging", "");
	}, []);

	const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
		const state = spin.current;
		if (!state.dragging || event.pointerId !== state.pointerId) {
			return;
		}
		const wall = event.currentTarget;
		const dx = event.clientX - state.lastX;
		const dt = Math.max(event.timeStamp - state.lastT, 1) / 1000;
		state.dragDistance += Math.abs(dx);
		/* capture late, so a plain click still reaches the card link */
		if (
			state.dragDistance > DRAG_SLOP &&
			!wall.hasPointerCapture(event.pointerId)
		) {
			wall.setPointerCapture(event.pointerId);
		}
		state.rotation -= dx * DRAG_GAIN;
		/* smoothed, so one jittery event can't fling the ring */
		state.velocity = lerp(state.velocity, (-dx * DRAG_GAIN) / dt, 0.4);
		state.lastX = event.clientX;
		state.lastT = event.timeStamp;
	}, []);

	const endDrag = useCallback((event: PointerEvent<HTMLElement>) => {
		const state = spin.current;
		if (event.pointerId !== state.pointerId) {
			return;
		}
		state.dragging = false;
		state.pointerId = -1;
		const held = event.timeStamp - state.lastT > FLING_WINDOW_MS;
		if (held || settings.current.reducedMotion) {
			state.velocity = 0;
		}
		event.currentTarget.removeAttribute("data-dragging");
	}, []);

	/* a drag that ends on a card must not open it */
	const onClickCapture = useCallback((event: MouseEvent) => {
		if (spin.current.dragDistance > DRAG_SLOP) {
			event.preventDefault();
			event.stopPropagation();
		}
	}, []);

	const onKeyDown = useCallback(
		(event: KeyboardEvent<HTMLElement>) => {
			if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
				return;
			}
			event.preventDefault();
			const state = spin.current;
			const nearest = Math.round(-state.rotation / step);
			const next = nearest + (event.key === "ArrowRight" ? 1 : -1);
			const index = ((next % count) + count) % count;
			cardEls()[index]?.focus({ preventScroll: true });
			state.target = -next * step;
		},
		[cardEls, count, step]
	);

	/* keyboard focus swings the card to the front; a mouse press focuses
	   too, and must not */
	const onCardFocus = useCallback(
		(event: FocusEvent<HTMLAnchorElement>) => {
			if (event.currentTarget.matches(":focus-visible")) {
				spin.current.target = -Number(event.currentTarget.dataset.index) * step;
			}
		},
		[step]
	);

	const playPreview = useCallback((event: PointerEvent<HTMLAnchorElement>) => {
		spin.current.hovering = true;
		const video = event.currentTarget.querySelector("video");
		if (!video || settings.current.reducedMotion) {
			return;
		}
		if (!video.src && video.dataset.src) {
			video.src = video.dataset.src;
		}
		video.play().catch(() => {
			/* autoplay can be refused; the poster stays */
		});
	}, []);

	const stopPreview = useCallback((event: PointerEvent<HTMLAnchorElement>) => {
		spin.current.hovering = false;
		event.currentTarget.querySelector("video")?.pause();
	}, []);

	return (
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: the wall is a drag surface; every card inside is a real link and the arrow keys move focus between them
		<section
			aria-label="everything i've shipped. drag, scroll or use the arrow keys to turn"
			className="wall"
			data-cursor="drag"
			onClickCapture={onClickCapture}
			onKeyDown={onKeyDown}
			onLostPointerCapture={endDrag}
			onPointerCancel={endDrag}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={endDrag}
			ref={wallRef}
		>
			<div className="wall-lens" ref={lensRef}>
				<div className="wall-center" ref={centerRef}>
					{cards.map((card, index) => {
						const world = toneFor(card.world);
						const dimmed = focus !== null && focus !== card.world;
						const external = isExternal(card.href);
						return (
							<Link
								aria-label={`${card.title}, ${world.label}, ${card.tag}${external ? ", on stormej.me (opens in a new tab)" : ""}`}
								className="card"
								data-cursor={
									card.kind === "reel" || card.kind === "clip" ? "play" : "open"
								}
								data-dimmed={dimmed || undefined}
								data-index={index}
								data-kind={card.kind}
								data-world={card.world}
								draggable={false}
								href={card.href}
								key={card.id}
								onFocus={onCardFocus}
								onPointerEnter={playPreview}
								onPointerLeave={stopPreview}
								rel={external ? "noopener noreferrer" : undefined}
								style={
									{
										"--on": world.on,
										"--world": world.color,
										opacity: 0,
										transform: cardTransform(
											index,
											step,
											radius,
											INTRO_DEPTH,
											INTRO_SCALE
										),
									} as React.CSSProperties
								}
								target={external ? "_blank" : undefined}
							>
								<span className="card-tilt">
									<span aria-hidden className="card-frame" />
									<span className="card-face">
										<CardFace card={card} />
										<span aria-hidden className="card-tag">
											{card.tag}
										</span>
										<span aria-hidden className="card-label">
											<b>{world.label}</b>
											<span>{card.title}</span>
											<i>{external ? "↗" : "→"}</i>
										</span>
									</span>
								</span>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}

/** what a card shows: a screenshot, a clip, or type on its colour */
export function CardFace({ card }: { card: Card }) {
	switch (card.kind) {
		case "shot":
			return (
				<Image
					alt=""
					className="card-media"
					draggable={false}
					fill
					loading="eager"
					sizes="270px"
					src={card.image}
					unoptimized
				/>
			);
		case "reel":
			return (
				<>
					<Image
						alt=""
						className="card-media"
						draggable={false}
						fill
						loading="eager"
						sizes="270px"
						src={card.image}
						unoptimized
					/>
					<video
						aria-hidden
						className="card-media card-video"
						data-src={card.video}
						loop
						muted
						playsInline
						preload="none"
						tabIndex={-1}
					/>
				</>
			);
		case "clip":
			return (
				<span className="card-clip">
					<span className="card-clip-title">{card.title}</span>
					<span className="card-clip-screen">
						<Image
							alt=""
							className="card-media"
							draggable={false}
							fill
							loading="eager"
							sizes="250px"
							src={card.image}
							unoptimized
						/>
						<video
							aria-hidden
							className="card-media card-video"
							data-src={card.video}
							loop
							muted
							playsInline
							preload="none"
							tabIndex={-1}
						/>
					</span>
				</span>
			);
		default:
			return (
				<span className="card-type">
					<span className="card-type-kicker">{card.kicker}</span>
					<span className="card-type-title">{card.title}</span>
				</span>
			);
	}
}
