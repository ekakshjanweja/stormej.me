"use client";

import { useEffect, useRef } from "react";
import { WORLDS, type WorldId } from "../_lib/content";
import { useDrift } from "../_lib/drift";
import { SkyBand } from "./sky";

/* the top of every page: the ring's sky in a rounded window, tinted toward
   the page's world, with something hanging in it and the page's name set
   over the clouds. its loops pause while it's scrolled away */

interface BandProps {
	/** the page's name and line, set over the clouds */
	children: React.ReactNode;
	/** what hangs in the sky: an arc of cards, a clip */
	hang?: React.ReactNode;
	/** the heading that names the band */
	labelledBy: string;
	size?: "world" | "case" | "short";
	world?: WorldId | null;
}

export function Band({
	children,
	hang,
	labelledBy,
	size = "world",
	world = null,
}: BandProps) {
	const ref = useRef<HTMLElement>(null);
	useDrift(ref);

	useEffect(() => {
		const band = ref.current;
		if (!band) {
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			band.toggleAttribute("data-away", !entry?.isIntersecting);
		});
		observer.observe(band);
		return () => observer.disconnect();
	}, []);

	return (
		<section
			aria-labelledby={labelledBy}
			className="band"
			data-has-hang={hang ? "" : undefined}
			data-reveal
			data-size={size}
			data-world={world ?? undefined}
			ref={ref}
			style={
				world
					? ({
							"--on": WORLDS[world].on,
							"--world": WORLDS[world].color,
						} as React.CSSProperties)
					: undefined
			}
		>
			<div className="band-frame">
				<SkyBand world={world}>
					{hang ? <div className="band-hang">{hang}</div> : null}
				</SkyBand>
				<div className="band-copy">{children}</div>
			</div>
		</section>
	);
}
