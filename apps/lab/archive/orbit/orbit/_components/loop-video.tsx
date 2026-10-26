"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/* a short silent loop that only runs while it's on screen. under reduced
   motion it stays on its poster */

interface LoopVideoProps {
	className?: string;
	poster: string;
	src: string;
}

/** share of the clip that has to be visible before it plays */
const VISIBLE = 0.35;

export function LoopVideo({ className, poster, src }: LoopVideoProps) {
	const ref = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = ref.current;
		if (!video || prefersReducedMotion()) {
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					video.play().catch(() => {
						/* refused; the poster stays */
					});
				} else {
					video.pause();
				}
			},
			{ threshold: VISIBLE }
		);
		observer.observe(video);
		return () => {
			observer.disconnect();
			video.pause();
		};
	}, []);

	return (
		<video
			aria-hidden="true"
			className={className}
			loop
			muted
			playsInline
			poster={poster}
			preload="none"
			ref={ref}
			src={src}
			tabIndex={-1}
		/>
	);
}
