"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A muted, looping clip that only plays while it is on screen. Nothing is
 * fetched until it scrolls into view, and reduced motion keeps the poster.
 */
export function InlineClip({
	src,
	poster,
	label,
	className,
}: {
	src: string;
	poster?: string;
	label: string;
	className?: string;
}) {
	const ref = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = ref.current;
		if (!video) {
			return;
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					video.play().catch(() => {
						// autoplay refused (low power mode etc.), the poster stays up
					});
				} else {
					video.pause();
				}
			},
			{ threshold: 0.35 }
		);
		observer.observe(video);
		return () => observer.disconnect();
	}, []);

	return (
		<video
			aria-label={label}
			className={cn("h-full w-full object-cover", className)}
			loop
			muted
			playsInline
			poster={poster}
			preload="none"
			ref={ref}
			src={src}
		/>
	);
}
