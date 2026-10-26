"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SIDEWAYS } from "../_lib/gsap";

/* how far along the page you are: a short line at the bottom while the
   pages run sideways, a hairline down the right edge while they stack.
   sideways travel is driven by the vertical scroll, so one number serves
   both */
export function Progress() {
	const pathname = usePathname();
	const barRef = useRef<HTMLSpanElement>(null);
	const [sideways, setSideways] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(SIDEWAYS);
		const apply = () => setSideways(media.matches);
		apply();
		media.addEventListener("change", apply);
		return () => media.removeEventListener("change", apply);
	}, []);

	useEffect(() => {
		const bar = barRef.current;
		if (!(bar && pathname)) {
			return;
		}
		const axis = sideways ? "scaleX" : "scaleY";
		const update = () => {
			const max = document.documentElement.scrollHeight - window.innerHeight;
			const progress = max > 0 ? window.scrollY / max : 0;
			bar.style.transform = `${axis}(${progress})`;
		};
		update();
		/* lenis drives the real window scroll, so this hears it too. a new
		   page changes the height before anyone scrolls, so a resize counts */
		window.addEventListener("scroll", update, { passive: true });
		const observer = new ResizeObserver(update);
		observer.observe(document.body);
		return () => {
			window.removeEventListener("scroll", update);
			observer.disconnect();
		};
	}, [sideways, pathname]);

	return (
		<span
			aria-hidden="true"
			className="progress"
			data-axis={sideways ? "x" : "y"}
		>
			<span className="progress-bar" ref={barRef} />
		</span>
	);
}
