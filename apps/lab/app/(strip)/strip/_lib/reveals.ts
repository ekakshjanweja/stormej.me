import type { gsap } from "./gsap";

/** the sideways tween while a page runs sideways, nothing while it stacks */
export type Along = gsap.core.Tween | undefined;

/** where a scroll reveal starts. sideways, "80%" means "when its left edge
    crosses 80% of the screen"; stacked, "when its top does" */
export const at = (along: Along, start: string) =>
	along
		? { containerAnimation: along, start: `left ${start}` }
		: { start: `top ${start}` };
