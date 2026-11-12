/* the lab's index is desktop only: wherever DESKTOP doesn't match, it
   shows a note and a link to the portfolio instead (components/desktop-only).
   strip opens anywhere, and runs sideways only where SIDEWAYS matches.
   components/desktop-only.css and strip's css repeat them word for word */

/** room to stand the panels up, and a mouse or trackpad to drive them */
export const DESKTOP =
	"(min-width: 1200px) and (min-height: 600px) and (hover: hover) and (pointer: fine)";

/** strip runs sideways on a desktop that welcomes motion */
export const SIDEWAYS = `${DESKTOP} and (prefers-reduced-motion: no-preference)`;
