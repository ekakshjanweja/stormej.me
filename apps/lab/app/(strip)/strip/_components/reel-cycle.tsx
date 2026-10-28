"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PLAYABLE_REELS } from "@/lib/profile";
import { reducedMotion } from "../_lib/gsap";
import { playingFlags } from "../_lib/playing";
import { ProgressiveImage } from "./progressive-image";
import { ReelPlayer, type ReelPlayerHandle } from "./reel-player";

/* the reels in the space of two: two squares play, silently, and every few
   seconds the pair slides on to the next reel. reach for the row and it
   opens out to all of them; a click plays one with sound */

const SHOWN = 2;
const EVERY_MS = 4200;
const COUNT = PLAYABLE_REELS.length;

function Tile({
	index,
	live,
	onOpen,
	reel,
}: {
	index: number;
	/** on screen and allowed to play */
	live: boolean;
	onOpen: (index: number) => void;
	reel: (typeof PLAYABLE_REELS)[number];
}) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}
		if (live) {
			video.play().catch(() => undefined);
		} else {
			video.pause();
		}
	}, [live]);

	const open = useCallback(() => onOpen(index), [index, onOpen]);

	return (
		<button
			aria-label={`play "${reel.title}" with sound`}
			className="rc-face"
			data-cursor="view"
			data-cursor-label="play"
			onClick={open}
			type="button"
		>
			<ProgressiveImage alt="" fill sizes="220px" src={reel.cover} />
			<video
				aria-hidden="true"
				className="rc-video"
				{...playingFlags}
				loop
				muted
				playsInline
				preload="none"
				ref={videoRef}
				src={reel.video}
				tabIndex={-1}
			/>
			<span className="rc-title">{reel.title}</span>
		</button>
	);
}

export function ReelCycle() {
	const rootRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<ReelPlayerHandle>(null);
	const [first, setFirst] = useState(0);
	const [open, setOpen] = useState(false);
	const [inView, setInView] = useState(false);
	const [still, setStill] = useState(true);

	useEffect(() => {
		setStill(reducedMotion());
		const root = rootRef.current;
		if (!root) {
			return;
		}
		const observer = new IntersectionObserver(([entry]) =>
			setInView(Boolean(entry?.isIntersecting))
		);
		observer.observe(root);
		return () => observer.disconnect();
	}, []);

	/* slide on while it's on screen and closed */
	useEffect(() => {
		if (still || open || !inView || COUNT <= SHOWN) {
			return;
		}
		const timer = window.setInterval(
			() => setFirst((current) => (current + 1) % COUNT),
			EVERY_MS
		);
		return () => window.clearInterval(timer);
	}, [still, open, inView]);

	const onOpen = useCallback((index: number) => {
		playerRef.current?.open(index);
	}, []);
	/* reaching for the row (pointer or keyboard) opens it out */
	useEffect(() => {
		const root = rootRef.current;
		if (!root) {
			return;
		}
		const show = () => setOpen(true);
		const hide = () => setOpen(false);
		const leave = (event: FocusEvent) => {
			if (!root.contains(event.relatedTarget as Node | null)) {
				setOpen(false);
			}
		};
		root.addEventListener("pointerenter", show);
		root.addEventListener("pointerleave", hide);
		root.addEventListener("focusin", show);
		root.addEventListener("focusout", leave);
		return () => {
			root.removeEventListener("pointerenter", show);
			root.removeEventListener("pointerleave", hide);
			root.removeEventListener("focusin", show);
			root.removeEventListener("focusout", leave);
		};
	}, []);

	/* in the pair that's showing; an open row shows the rest as well */
	const inPair = (index: number) => (index - first + COUNT) % COUNT < SHOWN;

	return (
		<>
			<div className="rc" data-open={open ? "" : undefined} ref={rootRef}>
				<ul aria-label="reels from stormej.studio" className="rc-row">
					{PLAYABLE_REELS.map((reel, index) => (
						<li
							className="rc-item"
							data-shown={inPair(index) ? "" : undefined}
							key={reel.href}
						>
							<Tile
								index={index}
								live={inView && !still && (open || inPair(index))}
								onOpen={onOpen}
								reel={reel}
							/>
						</li>
					))}
				</ul>
				<p aria-hidden="true" className="rc-hint">
					{open ? "click one for sound" : `${COUNT} reels · hover for all`}
				</p>
			</div>
			<ReelPlayer reels={PLAYABLE_REELS} ref={playerRef} />
		</>
	);
}
