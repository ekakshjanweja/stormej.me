"use client";

import {
	type Ref,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { Reel } from "@/lib/profile";
import { gsap, reducedMotion } from "../_lib/gsap";
import { giveSound, takeSound } from "../_lib/sound";
import { SoundButton } from "./sound-button";

export interface ReelPlayerHandle {
	open: (index: number) => void;
}

type PlayableReel = Reel & { video: string };

/* a reel, big, with its sound. it opens because someone clicked, so the
   browser lets it play out loud straight away. arrows step through the
   rest; esc, the close button or a click outside ends it */
export function ReelPlayer({
	reels,
	ref,
}: {
	reels: PlayableReel[];
	ref: Ref<ReelPlayerHandle>;
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [index, setIndex] = useState(0);
	const [audible, setAudible] = useState(true);
	const [captions, setCaptions] = useState(false);
	const indexRef = useRef(0);
	const reel = reels[index];

	const play = useCallback(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}
		video.currentTime = 0;
		giveSound(video);
	}, []);

	useImperativeHandle(ref, () => ({
		open: (target) => {
			const dialog = dialogRef.current;
			if (!dialog) {
				return;
			}
			setIndex(target);
			/* the same reel again won't change state, so start it here */
			if (target === indexRef.current) {
				requestAnimationFrame(play);
			}
			if (!dialog.open) {
				dialog.showModal();
				if (!reducedMotion()) {
					gsap.fromTo(
						dialog.querySelector("[data-reel-frame]"),
						{ clipPath: "inset(30% 20% round 24px)", scale: 0.9 },
						{
							clipPath: "inset(0% 0% round 18px)",
							duration: 0.9,
							ease: "expo.out",
							scale: 1,
						}
					);
				}
			}
		},
	}));

	/* a new reel (or the first) starts from the top, out loud */
	useEffect(() => {
		indexRef.current = index;
		if (dialogRef.current?.open) {
			play();
		}
	}, [index, play]);

	const close = useCallback(() => {
		const video = videoRef.current;
		if (video) {
			video.pause();
			takeSound(video);
		}
		dialogRef.current?.close();
	}, []);

	const step = useCallback(
		(by: number) =>
			setIndex((current) => (current + by + reels.length) % reels.length),
		[reels.length]
	);
	const previous = useCallback(() => step(-1), [step]);
	const next = useCallback(() => step(1), [step]);

	const toggleCaptions = useCallback(() => setCaptions((value) => !value), []);

	/* the track element is swapped with each reel, so reapply the choice */
	useEffect(() => {
		const track = videoRef.current?.textTracks[0];
		if (track && reel) {
			track.mode = captions ? "showing" : "hidden";
		}
	}, [captions, reel]);

	const toggleSound = useCallback(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}
		if (video.muted) {
			giveSound(video);
		} else {
			takeSound(video);
		}
	}, []);

	useEffect(() => {
		const dialog = dialogRef.current;
		const video = videoRef.current;
		if (!(dialog && video)) {
			return;
		}
		const onClose = () => {
			video.pause();
			takeSound(video);
		};
		/* a click on the backdrop lands on the dialog itself */
		const onClick = (event: MouseEvent) => {
			if (event.target === dialog) {
				close();
			}
		};
		const onVolume = () => setAudible(!video.muted);
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "ArrowRight") {
				next();
			} else if (event.key === "ArrowLeft") {
				previous();
			}
		};
		dialog.addEventListener("keydown", onKey);
		dialog.addEventListener("close", onClose);
		dialog.addEventListener("click", onClick);
		video.addEventListener("volumechange", onVolume);
		return () => {
			dialog.removeEventListener("keydown", onKey);
			dialog.removeEventListener("close", onClose);
			dialog.removeEventListener("click", onClick);
			video.removeEventListener("volumechange", onVolume);
		};
	}, [close, next, previous]);

	return (
		<dialog
			aria-label="reels from stormej.studio"
			className="player"
			ref={dialogRef}
		>
			<div className="player-body">
				<div className="player-frame" data-reel-frame="">
					<video
						aria-label={reel?.title}
						loop
						playsInline
						poster={reel?.cover}
						preload="none"
						ref={videoRef}
						src={reel?.video}
					>
						<track
							key={reel?.captions}
							kind="captions"
							label="english"
							src={reel?.captions}
							srcLang="en"
						/>
					</video>
				</div>
				<div className="player-side">
					<p className="player-count">
						{String(index + 1).padStart(2, "0")} /{" "}
						{String(reels.length).padStart(2, "0")}
					</p>
					<p className="player-title">{reel?.title}</p>
					<p className="player-date">{reel?.date}</p>
					<div className="player-toggles">
						<SoundButton
							audible={audible}
							onToggle={toggleSound}
							tone="paper"
						/>
						<button
							aria-pressed={captions}
							className="sound"
							data-tone="paper"
							onClick={toggleCaptions}
							type="button"
						>
							cc
						</button>
					</div>
					<div className="player-steps">
						<button onClick={previous} type="button">
							← previous
						</button>
						<button onClick={next} type="button">
							next →
						</button>
					</div>
					<a href={reel?.href} rel="noopener" target="_blank">
						on instagram ↗
					</a>
					<button className="player-close" onClick={close} type="button">
						close <kbd>esc</kbd>
					</button>
				</div>
			</div>
		</dialog>
	);
}
