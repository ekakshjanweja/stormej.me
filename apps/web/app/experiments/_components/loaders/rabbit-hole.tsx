"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useId, useRef } from "react";
import { pageIntro } from "@/components/curtain/page-intro";
import { COVER, type LoaderProps } from "./types";

gsap.registerPlugin(useGSAP);

/** one ring per stop on the way down; the last one opens onto the page */
const LABELS = [
	"ekaksh janweja",
	"early-stage engineer",
	"product · mobile · ai",
	"bullzeye",
	"fpv labs",
	"digital domi",
	"lumen",
	"burrow",
	"aarthiq",
	"turi",
	"flutter · dart",
	"riverpod",
	"idea",
	"production",
];
/** ring, then text: ink on paper, paper on ink, paper on sage */
const SCHEMES = [
	["var(--foreground)", "var(--background)"],
	["var(--highlight)", "var(--background)"],
	["var(--background)", "var(--foreground)"],
] as const;
/** in viewBox units: a band from r=25 to r=50, so each ring's hole is
 *  exactly the next ring's outside */
const MID = 37.5;
const BAND = 25;
const CIRCUMFERENCE = 2 * Math.PI * MID;

/**
 * Down the rabbit hole: concentric rings, each half the size of the last,
 * each lettered with a stop on the way (the name, the roles, every project),
 * counter-rotating as the camera falls through them, faster and faster,
 * until the last ring passes and the page is at the bottom.
 */
export function RabbitHole({ onDone }: LoaderProps) {
	const root = useRef<HTMLDivElement>(null);
	const id = useId();

	useGSAP(
		() => {
			const rings = gsap.utils
				.selector(root)("[data-ring]")
				.map((el) => ({
					el,
					set: gsap.quickSetter(el, "css"),
					twist: gsap.utils.random(0, 360),
				}));
			const depth = { z: 0 };

			/* ring i sits 2^(z - i) times the screen's size; past ~2.2 its hole
			   clears the screen and below ~1/500 it's a speck. this runs every
			   frame, so quick setters rather than a gsap.set() tween per ring */
			const render = () => {
				for (const [i, ring] of rings.entries()) {
					const scale = 2 ** (depth.z - i);
					const shown = scale < 2.2 && scale > 0.002;
					ring.el.style.display = shown ? "block" : "none";
					ring.set({
						rotation: ring.twist + depth.z * 50 * (i % 2 ? 1 : -1),
						scale,
					});
				}
			};
			render();

			const tl = gsap.timeline({ onComplete: onDone });
			tl.to(depth, {
				duration: 4.4,
				ease: "power2.in",
				onUpdate: render,
				z: LABELS.length + 1.2,
			})
				.set(root.current, { pointerEvents: "none" }, 3.9)
				.add(pageIntro(), 4.25);
		},
		{ scope: root }
	);

	/* sized to the screen's diagonal so the outer ring covers the corners */
	const size = "max(142vw, 142vh)";

	return (
		<div aria-hidden className={COVER} ref={root}>
			{LABELS.map((label, i) => {
				const [ring, ink] = SCHEMES[i % SCHEMES.length] ?? SCHEMES[0];
				const path = `${id}-${i}`;
				const text = `${label} · `.repeat(label.length > 14 ? 3 : 4);
				return (
					<svg
						aria-hidden
						className="absolute top-1/2 left-1/2"
						data-ring
						key={label}
						style={{
							height: size,
							marginLeft: `calc(${size} / -2)`,
							marginTop: `calc(${size} / -2)`,
							width: size,
						}}
						viewBox="-50 -50 100 100"
					>
						<title>{label}</title>
						<defs>
							<path
								d={`M 0 ${-MID} a ${MID} ${MID} 0 1 1 0 ${2 * MID} a ${MID} ${MID} 0 1 1 0 ${-2 * MID}`}
								id={path}
							/>
						</defs>
						<circle
							fill="none"
							r={MID}
							strokeWidth={BAND}
							style={{ stroke: ring }}
						/>
						<text
							dominantBaseline="central"
							fontSize={7.5}
							letterSpacing={0.6}
							style={{
								fill: ink,
								fontFamily: "var(--font-geist-mono)",
								textTransform: "uppercase",
							}}
						>
							<textPath
								href={`#${path}`}
								lengthAdjust="spacingAndGlyphs"
								textLength={CIRCUMFERENCE - 1}
							>
								{text}
							</textPath>
						</text>
					</svg>
				);
			})}
		</div>
	);
}
