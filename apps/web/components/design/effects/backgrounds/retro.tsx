// adapted from magic ui's retro-grid (magicui.design), its css fallback path
import type { BackgroundProps } from "./types";

/** a grid floor tipped back in perspective and rolling toward the viewer */
export function Retro({ still }: BackgroundProps) {
	return (
		<div className="fx-retro" data-still={still || undefined}>
			<div className="fx-retro-plane">
				<div className="fx-retro-grid" />
			</div>
		</div>
	);
}
