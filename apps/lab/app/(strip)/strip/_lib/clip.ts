"use client";

import { useSyncExternalStore } from "react";
import { playSfx } from "@/lib/sfx";
import { reducedMotion } from "./gsap";
import { claimSound } from "./sound";

/* a bit of a song, played right here: one shared <audio> for the page, so
   only one clip plays at a time. it fades in, and out again near the end or
   when stopped, instead of cutting */

const FADE_MS = 450;
const VOLUME = 0.8;
/* start fading this long before the clip runs out */
const TAIL_S = 1.2;

interface ClipState {
	playing: boolean;
	progress: number;
	src: string | null;
}

let state: ClipState = { playing: false, progress: 0, src: null };
let audio: HTMLAudioElement | null = null;
let fadeFrame = 0;
let tailing = false;
const listeners = new Set<() => void>();
const IDLE: ClipState = { playing: false, progress: 0, src: null };

const publish = (next: Partial<ClipState>) => {
	state = { ...state, ...next };
	for (const listener of listeners) {
		listener();
	}
};

const fadeTo = (target: number, then?: () => void) => {
	const element = audio;
	if (!element) {
		return;
	}
	cancelAnimationFrame(fadeFrame);
	if (reducedMotion()) {
		element.volume = target;
		then?.();
		return;
	}
	const from = element.volume;
	const start = performance.now();
	const step = (now: number) => {
		/* a frame's timestamp can come from just before the fade began */
		const t = Math.min(1, Math.max(0, (now - start) / FADE_MS));
		element.volume = Math.min(1, Math.max(0, from + (target - from) * t));
		if (t < 1) {
			fadeFrame = requestAnimationFrame(step);
		} else {
			then?.();
		}
	};
	fadeFrame = requestAnimationFrame(step);
};

const element = () => {
	if (audio) {
		return audio;
	}
	audio = new Audio();
	audio.preload = "none";
	audio.addEventListener("timeupdate", () => {
		const current = audio as HTMLAudioElement;
		if (!current.duration) {
			return;
		}
		publish({ progress: current.currentTime / current.duration });
		if (!tailing && current.duration - current.currentTime < TAIL_S) {
			tailing = true;
			fadeTo(0);
		}
	});
	audio.addEventListener("ended", () => publish(IDLE));
	audio.addEventListener("pause", () => publish({ playing: false }));
	audio.addEventListener("playing", () => publish({ playing: true }));
	return audio;
};

/** quiet whatever clip is playing, with a fade */
export const stopClip = () => {
	if (!(audio && state.src)) {
		return;
	}
	const current = audio;
	fadeTo(0, () => current.pause());
	publish(IDLE);
};

/** play a clip, or stop it if it's the one already playing */
export const toggleClip = (src: string) => {
	if (state.src === src && state.playing) {
		stopClip();
		return;
	}
	const current = element();
	claimSound(stopClip);
	playSfx("needle");
	if (current.src !== src) {
		current.src = src;
	}
	/* every play is a fresh bit, from the top */
	current.currentTime = 0;
	tailing = false;
	current.volume = 0;
	publish({ playing: false, progress: 0, src });
	current
		.play()
		.then(() => fadeTo(VOLUME))
		.catch(() => publish(IDLE));
};

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

const snapshot = () => state;
const serverSnapshot = () => IDLE;

/** what the shared clip is doing, for a button that shows it */
export const useClip = () =>
	useSyncExternalStore(subscribe, snapshot, serverSnapshot);
