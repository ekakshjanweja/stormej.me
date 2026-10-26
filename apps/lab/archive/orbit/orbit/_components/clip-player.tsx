"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { claimSound, releaseSound } from "../_lib/sound";

/* a vertical clip with its own sound. it previews muted while it's on
   screen and pauses when it isn't; pressing it turns the sound up (and any
   other clip's down), from the start, with captions. under reduced motion
   nothing moves until it's pressed */

interface ClipPlayerProps {
	captions?: string;
	/** under the clip: its title, date, a link out */
	children?: React.ReactNode;
	className?: string;
	height: number;
	/** for anchors that jump to this clip */
	id?: string;
	poster: string;
	src: string;
	title: string;
	width: number;
}

/** share of the clip that has to be on screen for it to preview */
const VISIBLE = 0.5;

export function ClipPlayer({
	captions,
	children,
	className,
	height,
	id,
	poster,
	src,
	title,
	width,
}: ClipPlayerProps) {
	const key = useId();
	const videoRef = useRef<HTMLVideoElement>(null);
	const [sound, setSound] = useState(false);
	const soundRef = useRef(false);
	soundRef.current = sound;

	const quiet = useCallback(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}
		video.muted = true;
		if (prefersReducedMotion()) {
			video.pause();
		}
		setSound(false);
	}, []);

	/* preview while on screen; off screen, stop and give the sound back */
	useEffect(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					if (!prefersReducedMotion()) {
						video.play().catch(() => {
							/* refused; the poster stays */
						});
					}
					return;
				}
				video.pause();
				if (soundRef.current) {
					quiet();
					releaseSound(key);
				}
			},
			{ threshold: VISIBLE }
		);
		observer.observe(video);
		return () => {
			observer.disconnect();
			video.pause();
			releaseSound(key);
		};
	}, [key, quiet]);

	const toggle = useCallback(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}
		if (soundRef.current) {
			quiet();
			releaseSound(key);
			return;
		}
		claimSound(key, quiet);
		video.muted = false;
		video.currentTime = 0;
		video.play().catch(() => {
			video.muted = true;
		});
		setSound(true);
	}, [key, quiet]);

	return (
		<figure
			className={className ? `clip ${className}` : "clip"}
			data-sound={sound || undefined}
			id={id}
		>
			<div
				className="clip-screen"
				style={{ aspectRatio: `${width} / ${height}` }}
			>
				<video
					className="clip-video"
					loop
					muted
					playsInline
					poster={poster}
					preload="none"
					ref={videoRef}
					src={src}
				>
					{captions ? (
						<track
							default
							kind="captions"
							label="english"
							src={captions}
							srcLang="en"
						/>
					) : null}
				</video>
				<button
					aria-label={`${title}, with sound`}
					aria-pressed={sound}
					className="clip-toggle"
					data-cursor={sound ? "mute" : "sound"}
					onClick={toggle}
					type="button"
				>
					<span aria-hidden="true" className="clip-pill">
						<span className="clip-icon">
							<i />
							<i />
							<i />
						</span>
						{sound ? "sound on" : "sound"}
					</span>
				</button>
			</div>
			{children ? (
				<figcaption className="clip-caption">{children}</figcaption>
			) : null}
		</figure>
	);
}
