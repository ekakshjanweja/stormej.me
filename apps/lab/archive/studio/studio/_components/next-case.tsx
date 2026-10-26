"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { Case } from "@/lib/cases";
import { DitherSweep } from "../_lib/dither";
import { gsap, reducedMotion } from "../_lib/gsap";
import { caseHref, pad } from "../_lib/pages";
import { sizeOf } from "../_lib/sizes";
import { StudioLink } from "./studio-link";

/* the way on: one big card for the next case. pointing at it (or focusing
   it) floods it with the same sage dither the page curtain uses, so a click
   reads as the curtain carrying on. with reduced motion the colour just
   changes */

interface NextCaseProps {
	image?: string;
	/** worked out on the server: a case that crossed into the client is a copy */
	index: number;
	item: Case;
	total: number;
}

export function NextCase({ image, index, item, total }: NextCaseProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const sweepRef = useRef<DitherSweep | null>(null);
	const progress = useRef({ cover: 0 });

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || reducedMotion()) {
			return;
		}
		const sweep = new DitherSweep(canvas, {
			axis: "right",
			body: "#3d6a4c",
			cell: 6,
			lead: "#a6c6ae",
		});
		sweepRef.current = sweep;
		const observer = new ResizeObserver(() => {
			sweep.resize();
			sweep.draw(progress.current.cover);
		});
		observer.observe(canvas);
		return () => {
			observer.disconnect();
			gsap.killTweensOf(progress.current);
			sweepRef.current = null;
		};
	}, []);

	const flood = useCallback((cover: number) => {
		const sweep = sweepRef.current;
		if (!sweep) {
			return;
		}
		gsap.to(progress.current, {
			cover,
			duration: cover ? 0.55 : 0.4,
			ease: "power2.out",
			onUpdate: () => sweep.draw(progress.current.cover),
			overwrite: true,
		});
	}, []);

	const fill = useCallback(() => flood(1), [flood]);
	const drain = useCallback(() => flood(0), [flood]);

	const [width, height] = image ? sizeOf(image) : [0, 0];

	return (
		<section aria-labelledby="next-title" className="next-case">
			<h2 className="sr-only" id="next-title">
				next case
			</h2>
			<StudioLink
				aria-label={`next case: ${item.title}, ${item.subtitle}`}
				className="next-case-link"
				href={caseHref(item.slug)}
				onBlur={drain}
				onFocus={fill}
				onPointerEnter={fill}
				onPointerLeave={drain}
			>
				<canvas className="next-case-canvas" ref={canvasRef} />
				<span aria-hidden="true" className="next-case-label">
					next case · {pad(index)} / {pad(total)}
				</span>
				<span aria-hidden="true" className="next-case-title">
					{item.title}
				</span>
				<span aria-hidden="true" className="next-case-sub">
					{item.subtitle}
				</span>
				<span aria-hidden="true" className="next-case-arrow">
					→
				</span>
				{image ? (
					<span
						aria-hidden="true"
						className={`next-case-image is-${item.galleryShape}`}
					>
						<Image
							alt=""
							height={height}
							sizes="(max-width: 767px) 40vw, 320px"
							src={image}
							width={width}
						/>
					</span>
				) : null}
			</StudioLink>
			<StudioLink className="next-case-all" href="/studio/work">
				all the work <span aria-hidden="true">→</span>
			</StudioLink>
		</section>
	);
}
