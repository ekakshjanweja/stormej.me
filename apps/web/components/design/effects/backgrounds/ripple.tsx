// adapted from magic ui's ripple (magicui.design)
import type { CSSProperties } from "react";
import type { BackgroundProps } from "./types";

const RINGS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

/** rings breathing out from behind the intro; styled in app/design-motion.css */
export function Ripple({ still }: BackgroundProps) {
	return (
		<div className="fx-ripple" data-still={still || undefined}>
			{RINGS.map((ring) => (
				<span key={ring} style={{ "--ring": ring } as CSSProperties} />
			))}
		</div>
	);
}
