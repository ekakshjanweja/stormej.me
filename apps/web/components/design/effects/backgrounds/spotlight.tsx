// adapted from aceternity's spotlight-new (ui.aceternity.com)
import type { BackgroundProps } from "./types";

/** two fans of light swaying in from the top corners; styled in app/design-motion.css */
export function Spotlight({ still }: BackgroundProps) {
	return (
		<div className="fx-spotlight" data-still={still || undefined}>
			<div className="fx-spotlight-fan" data-side="left">
				<span />
				<span />
				<span />
			</div>
			<div className="fx-spotlight-fan" data-side="right">
				<span />
				<span />
				<span />
			</div>
		</div>
	);
}
