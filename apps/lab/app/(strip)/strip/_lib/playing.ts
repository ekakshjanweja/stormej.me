import type { SyntheticEvent } from "react";

/* a preview video stays invisible until it has a frame to show, so a slow
   load shows the still underneath instead of a blank box. spread onto a
   <video>; css reveals [data-playing] */
const on = (event: SyntheticEvent<HTMLVideoElement>) => {
	event.currentTarget.dataset.playing = "";
};
const off = (event: SyntheticEvent<HTMLVideoElement>) => {
	delete event.currentTarget.dataset.playing;
};

export const playingFlags = { onPause: off, onPlaying: on } as const;
