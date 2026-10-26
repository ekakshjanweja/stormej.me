"use client";

import Image from "next/image";
import {
	type Ref,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { SHOWREEL } from "../_lib/content";
import { gsap, reducedMotion, setPaused } from "../_lib/gsap";
import { ExternalLink } from "./external-link";

/* the reel player, and the showreel tile on the home page. opening grows a
   window out of the middle of the screen (inset 40% 30% → 30% → nothing)
   while the reel eases up from 0.75, playing out loud because someone
   clicked. arrows step through the rest; closing pinches it back in */

export type PlayableReel = (typeof SHOWREEL.reels)[number];

export interface ReelDialogHandle {
	open: (index: number) => void;
}

const { reels: SHOWREELS } = SHOWREEL;

interface ReelDialogProps {
	onClose?: () => void;
	reels?: readonly PlayableReel[];
	ref: Ref<ReelDialogHandle>;
}

const growIn = (dialog: HTMLDialogElement, video: HTMLVideoElement) => {
	const frame = dialog.querySelector(".reel-frame");
	gsap
		.timeline()
		.fromTo(
			dialog.querySelector(".reel-overlay"),
			{ opacity: 0 },
			{ duration: 1.25, ease: "power3.out", opacity: 1 },
			0
		)
		.fromTo(
			dialog.querySelector(".reel-inner"),
			{ yPercent: 70 },
			{ duration: 1.75, ease: "expoInOutBack", yPercent: 0 },
			0
		)
		.fromTo(
			frame,
			{ clipPath: "inset(40% 30% round 24px)", scale: 1 },
			{
				clipPath: "inset(30% 30% round 24px)",
				duration: 1,
				ease: "expo.out",
			},
			0
		)
		.to(
			frame,
			{ clipPath: "inset(0% 0% round 0px)", duration: 3, ease: "expo.inOut" },
			0.65
		)
		.fromTo(
			video,
			{ scale: 0.75 },
			{ duration: 3, ease: "power2.inOut", scale: 1 },
			0
		);
};

export function ReelDialog({
	onClose,
	ref,
	reels = SHOWREELS,
}: ReelDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [index, setIndex] = useState(0);
	const [muted, setMuted] = useState(false);
	const [captions, setCaptions] = useState(false);
	const reel = reels[index];

	const start = useCallback(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}
		video.currentTime = 0;
		video.muted = false;
		video.play().catch(() => undefined);
	}, []);

	/* each new reel starts from the top, with sound */
	useEffect(() => {
		if (dialogRef.current?.open && reel) {
			start();
		}
	}, [reel, start]);

	const open = useCallback(
		(at: number) => {
			const dialog = dialogRef.current;
			const video = videoRef.current;
			if (!(dialog && video) || dialog.open) {
				return;
			}
			dialog.showModal();
			setPaused("reel", true);
			/* a different reel starts from the effect above, once it's loaded */
			if (at === index) {
				start();
			} else {
				setIndex(at);
			}
			if (!reducedMotion()) {
				growIn(dialog, video);
			}
		},
		[index, start]
	);

	useImperativeHandle(ref, () => ({ open }), [open]);

	const close = useCallback(() => {
		const dialog = dialogRef.current;
		if (!dialog?.open) {
			return;
		}
		const done = () => {
			videoRef.current?.pause();
			dialog.close();
			setPaused("reel", false);
			onClose?.();
		};
		if (reducedMotion()) {
			done();
			return;
		}
		gsap
			.timeline({ onComplete: done })
			.to(dialog.querySelector(".reel-frame"), {
				clipPath: "inset(40% 40% round 24px)",
				duration: 0.9,
				ease: "expo.inOut",
				scale: 0.5,
			})
			.to(
				dialog.querySelector(".reel-overlay"),
				{ duration: 0.6, ease: "power2.in", opacity: 0 },
				0.3
			);
	}, [onClose]);

	const step = useCallback(
		(by: number) =>
			setIndex((current) => (current + by + reels.length) % reels.length),
		[reels.length]
	);
	const previous = useCallback(() => step(-1), [step]);
	const next = useCallback(() => step(1), [step]);

	const toggleSound = useCallback(() => {
		const video = videoRef.current;
		if (video) {
			video.muted = !video.muted;
		}
	}, []);
	const toggleCaptions = useCallback(() => setCaptions((value) => !value), []);

	useEffect(() => {
		const track = videoRef.current?.textTracks[0];
		if (track && reel) {
			track.mode = captions ? "showing" : "hidden";
		}
	}, [captions, reel]);

	useEffect(() => {
		const dialog = dialogRef.current;
		const video = videoRef.current;
		if (!(dialog && video)) {
			return;
		}
		const onCancel = (event: Event) => {
			event.preventDefault();
			close();
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "ArrowRight") {
				next();
			} else if (event.key === "ArrowLeft") {
				previous();
			}
		};
		const onVolume = () => setMuted(video.muted);
		dialog.addEventListener("cancel", onCancel);
		dialog.addEventListener("keydown", onKey);
		video.addEventListener("volumechange", onVolume);
		return () => {
			dialog.removeEventListener("cancel", onCancel);
			dialog.removeEventListener("keydown", onKey);
			video.removeEventListener("volumechange", onVolume);
		};
	}, [close, next, previous]);

	return (
		<dialog
			aria-label="reels from stormej.studio"
			className="reel"
			ref={dialogRef}
		>
			<div aria-hidden="true" className="reel-overlay" />
			<div className="reel-inner">
				<div className="reel-frame">
					<video
						aria-label={reel?.title}
						className="reel-video"
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
					<div className="reel-side">
						<p className="reel-count">
							{String(index + 1).padStart(2, "0")} /{" "}
							{String(reels.length).padStart(2, "0")}
						</p>
						<p className="reel-title">{reel?.title}</p>
						<div className="reel-toggles">
							<button
								aria-label="sound"
								aria-pressed={!muted}
								className="reel-toggle"
								onClick={toggleSound}
								type="button"
							>
								{muted ? "sound off" : "sound on"}
							</button>
							<button
								aria-label="captions"
								aria-pressed={captions}
								className="reel-toggle"
								onClick={toggleCaptions}
								type="button"
							>
								cc
							</button>
						</div>
						<div className="reel-steps">
							<button onClick={previous} type="button">
								← previous
							</button>
							<button onClick={next} type="button">
								next →
							</button>
						</div>
						{reel ? (
							<ExternalLink href={reel.href}>on instagram ↗</ExternalLink>
						) : null}
					</div>
				</div>
				<button className="reel-close" onClick={close} type="button">
					close
				</button>
			</div>
		</dialog>
	);
}

/* the home page's showreel tile: loops the newest reel silently while it's
   on screen (never with reduced motion) and opens the player */
export function Reel() {
	const playerRef = useRef<ReelDialogHandle>(null);
	const thumbRef = useRef<HTMLVideoElement>(null);
	const [first] = SHOWREELS;

	useEffect(() => {
		const thumb = thumbRef.current;
		if (!thumb || reducedMotion()) {
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (entry?.isIntersecting) {
				thumb.play().catch(() => undefined);
			} else {
				thumb.pause();
			}
		});
		observer.observe(thumb);
		return () => observer.disconnect();
	}, []);

	const open = useCallback(() => {
		thumbRef.current?.pause();
		playerRef.current?.open(0);
	}, []);

	const resume = useCallback(() => {
		if (!reducedMotion()) {
			thumbRef.current?.play().catch(() => undefined);
		}
	}, []);

	return (
		<>
			<button className="reel-thumb" onClick={open} type="button">
				{first ? (
					<>
						<Image
							alt=""
							className="reel-thumb-image"
							fill
							sizes="(min-width: 988px) 17vw, 50vw"
							src={first.cover}
						/>
						<video
							aria-hidden="true"
							className="reel-thumb-image"
							loop
							muted
							playsInline
							poster={first.cover}
							preload="metadata"
							ref={thumbRef}
							src={first.video}
							tabIndex={-1}
						/>
					</>
				) : null}
				<span aria-hidden="true" className="reel-thumb-shade" />
				<span className="reel-thumb-label">
					{SHOWREEL.label}
					<span className="reel-thumb-sub">
						{SHOWREELS.length} reels from @stormej.studio, with sound
					</span>
				</span>
				<span aria-hidden="true" className="reel-thumb-play">
					▶
				</span>
			</button>
			<ReelDialog onClose={resume} ref={playerRef} />
		</>
	);
}
