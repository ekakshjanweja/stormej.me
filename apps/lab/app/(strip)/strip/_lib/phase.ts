/* where the shell is: the preloader is up, the curtain is down, or the page
   is visible. pages hold their entrances until "ready" */

export type Phase = "loading" | "covered" | "ready";

let phase: Phase = "loading";
const listeners = new Set<(next: Phase) => void>();

export const getPhase = () => phase;

export const setPhase = (next: Phase) => {
	phase = next;
	for (const listener of listeners) {
		listener(next);
	}
};

const onPhase = (listener: (next: Phase) => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

/** runs `fn` once the page can be seen: now, or when the preloader or the
    curtain lifts. returns an unsubscribe */
export const whenReady = (fn: () => void) => {
	if (phase === "ready") {
		fn();
		return () => undefined;
	}
	const off = onPhase((next) => {
		if (next === "ready") {
			off();
			fn();
		}
	});
	return off;
};
