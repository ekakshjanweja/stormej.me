"use client";

/* only one clip may be heard at a time: turning one up turns the last one
   back down. each player registers a callback that mutes it */

let current: { id: string; mute: () => void } | null = null;

/** take the sound; whoever had it is muted */
export const claimSound = (id: string, mute: () => void) => {
	if (current && current.id !== id) {
		current.mute();
	}
	current = { id, mute };
};

/** give the sound back, if it's still ours */
export const releaseSound = (id: string) => {
	if (current?.id === id) {
		current = null;
	}
};
