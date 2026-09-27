// adapted from aceternity's aurora-background (ui.aceternity.com)
import type { BackgroundProps } from "./types";

/** two banded gradients drifting past each other; styled in app/design-motion.css */
export function Aurora({ still }: BackgroundProps) {
	return (
		<div className="fx-aurora" data-still={still || undefined}>
			<div className="fx-aurora-bands" />
		</div>
	);
}
