"use client";

import { type RefObject, useCallback, useEffect, useState } from "react";
import { reducedMotion } from "./gsap";

/* one reel speaks at a time: turning sound on for one mutes whichever had
   it. browsers only allow sound after a click, so reels always start muted */
let speaking: HTMLVideoElement | null = null;
let hushLast: (() => void) | null = null;

/** whatever starts making sound quiets whatever was before it: a reel, a
    film, a song clip. pass the way to quiet the new one */
export const claimSound = (hush: () => void) => {
	const previous = hushLast;
	hushLast = hush;
	if (previous && previous !== hush) {
		previous();
	}
};

const hushReel = () => {
	if (speaking) {
		speaking.muted = true;
		speaking = null;
	}
};

export const giveSound = (video: HTMLVideoElement) => {
	if (speaking && speaking !== video) {
		speaking.muted = true;
	}
	claimSound(hushReel);
	speaking = video;
	video.muted = false;
	video.play().catch(() => undefined);
};

export const takeSound = (video: HTMLVideoElement) => {
	video.muted = true;
	if (speaking === video) {
		speaking = null;
	}
};

/** a muted reel that plays while it's on screen (not with reduced motion,
    unless it has sound on), and whether it's audible right now */
export const useReel = (videoRef: RefObject<HTMLVideoElement | null>) => {
	const [audible, setAudible] = useState(false);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}
		const onVolume = () => setAudible(!video.muted);
		video.addEventListener("volumechange", onVolume);
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					if (!(reducedMotion() && video.muted)) {
						video.play().catch(() => undefined);
					}
				} else {
					video.pause();
					takeSound(video);
				}
			},
			{ threshold: 0.2 }
		);
		observer.observe(video);
		return () => {
			observer.disconnect();
			video.removeEventListener("volumechange", onVolume);
			takeSound(video);
		};
	}, [videoRef]);

	const toggle = useCallback(() => {
		const video = videoRef.current;
		if (!video) {
			return;
		}
		if (video.muted) {
			giveSound(video);
		} else {
			takeSound(video);
		}
	}, [videoRef]);

	return { audible, toggle };
};
