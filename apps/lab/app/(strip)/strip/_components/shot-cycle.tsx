"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { reducedMotion } from "../_lib/gsap";

const EVERY_MS = 2600;

/* several screens in the space of one: they take turns, each rising
   softly into place as the last fades. it rests while it's off screen
   and stays on the first with reduced motion; a click moves it on */
export function ShotCycle({
	alt,
	screens,
}: {
	alt: string;
	screens: string[];
}) {
	const frameRef = useRef<HTMLButtonElement>(null);
	const [shown, setShown] = useState(0);
	const [visible, setVisible] = useState(false);

	const next = useCallback(
		() => setShown((current) => (current + 1) % screens.length),
		[screens.length]
	);

	useEffect(() => {
		const frame = frameRef.current;
		if (!frame) {
			return;
		}
		const observer = new IntersectionObserver(([entry]) =>
			setVisible(Boolean(entry?.isIntersecting))
		);
		observer.observe(frame);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!visible || reducedMotion() || screens.length < 2) {
			return;
		}
		const timer = window.setInterval(next, EVERY_MS);
		return () => window.clearInterval(timer);
	}, [visible, next, screens.length]);

	return (
		<button
			aria-label={`${alt}: screen ${shown + 1} of ${screens.length}, show the next`}
			className="cycle"
			data-cursor="view"
			data-cursor-label="next"
			onClick={next}
			ref={frameRef}
			type="button"
		>
			{screens.map((src, index) => (
				<span
					aria-hidden="true"
					className="cycle-screen"
					data-shown={index === shown ? "" : undefined}
					key={src}
				>
					<Image alt="" fill sizes="(min-width: 1200px) 24vh, 50vw" src={src} />
				</span>
			))}
			<span aria-hidden="true" className="cycle-dots">
				{screens.map((src, index) => (
					<span data-on={index === shown ? "" : undefined} key={src} />
				))}
			</span>
		</button>
	);
}
