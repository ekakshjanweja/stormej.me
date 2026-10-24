"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { cssVar, pageIntro } from "@/components/curtain/page-intro";
import { COVER, type LoaderProps } from "./types";

gsap.registerPlugin(useGSAP);

/** enough squares to read as a graph, few enough for the DOM to keep up */
const MAX_CELLS = 1400;
const MIN_PITCH = 22;

interface Grid {
	cols: number;
	pitch: number;
	rows: number;
}

function measureGrid(): Grid {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const pitch = Math.max(
		MIN_PITCH,
		Math.ceil(Math.sqrt((vw * vh) / MAX_CELLS))
	);
	return { cols: Math.ceil(vw / pitch), pitch, rows: Math.ceil(vh / pitch) };
}

/** which cells spell the word, drawn small on a canvas and read back */
function litCells({ cols, rows }: Grid, text: string): boolean[] {
	const canvas = document.createElement("canvas");
	canvas.width = cols;
	canvas.height = rows;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		return [];
	}
	const family = getComputedStyle(document.body).fontFamily;
	let size = rows * 0.62;
	ctx.font = `600 ${size}px ${family}`;
	const { width } = ctx.measureText(text);
	if (width > cols * 0.84) {
		size *= (cols * 0.84) / width;
		ctx.font = `600 ${size}px ${family}`;
	}
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(text, cols / 2, rows / 2 + size * 0.06);
	const { data } = ctx.getImageData(0, 0, cols, rows);
	return Array.from(
		{ length: cols * rows },
		(_, i) => (data[i * 4 + 3] ?? 0) > 110
	);
}

/**
 * The contribution graph, taken over: the whole screen fills with squares,
 * waves of commits wash across it, the squares spell the name like those
 * hand-drawn github graphs, then they wink out cell by cell.
 */
export function Contributions({ onDone }: LoaderProps) {
	const root = useRef<HTMLDivElement>(null);
	const [grid] = useState(measureGrid);

	useGSAP(
		() => {
			const q = gsap.utils.selector(root);
			const cells = q("[data-cell]");
			const squares = q("[data-square]");
			const { cols, rows } = grid;
			const shape: [number, number] = [rows, cols];

			const paper = cssVar("--background") || "#f5f6f2";
			const accent = cssVar("--highlight") || "#3d6a4c";
			const empty = cssVar("--card") || "#ebede7";
			/* github's five steps, from no commits to a lot */
			const level = [
				empty,
				gsap.utils.interpolate(paper, accent, 0.3),
				gsap.utils.interpolate(paper, accent, 0.55),
				gsap.utils.interpolate(paper, accent, 0.8),
				accent,
			] as const;
			const lit = litCells(grid, cols / rows > 1.3 ? "ekaksh" : "ej");
			const anywhere = () => gsap.utils.random(0, cols * rows - 1, 1);

			gsap.set(squares, { backgroundColor: empty });
			const tl = gsap.timeline({ onComplete: onDone });

			tl.from(squares, {
				duration: 0.5,
				ease: "back.out(3)",
				scale: 0,
				stagger: { amount: 0.8, from: "center", grid: shape },
			});

			/* commit storms: waves of green rolling out from random cells */
			for (const [i, at] of [0.55, 0.95, 1.3, 1.6].entries()) {
				tl.to(
					squares,
					{
						duration: 0.55,
						ease: "power1.out",
						keyframes: {
							backgroundColor: [level[4], level[2], i % 2 ? empty : level[1]],
						},
						stagger: { amount: 0.9, from: anywhere(), grid: shape },
					},
					at
				);
			}

			/* the name, in commits */
			tl.to(
				squares,
				{
					backgroundColor: (i) =>
						lit[i]
							? accent
							: (level[Math.random() < 0.82 ? 0 : gsap.utils.random(1, 2, 1)] ??
								empty),
					duration: 0.3,
					ease: "power2.out",
					stagger: { amount: 0.6, from: "center", grid: shape },
				},
				2.4
			)
				.to(
					squares.filter((_, i) => lit[i]),
					{
						duration: 0.4,
						ease: "power2.out",
						repeat: 1,
						scale: 1.35,
						stagger: { amount: 0.4, from: "center", grid: "auto" },
						yoyo: true,
					},
					2.7
				)
				.set(root.current, { pointerEvents: "none" }, 3.6)
				/* cell by cell, the page shows through */
				.to(
					cells,
					{
						borderRadius: "50%",
						duration: 0.55,
						ease: "power3.in",
						rotation: 45,
						scale: 0,
						stagger: { amount: 0.9, from: "center", grid: shape },
					},
					3.6
				)
				.add(pageIntro(), 4.0);
		},
		{ scope: root }
	);

	const { cols, pitch, rows } = grid;

	return (
		<div aria-hidden className={COVER} ref={root}>
			<div
				className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2"
				style={{
					gridTemplateColumns: `repeat(${cols}, ${pitch}px)`,
					gridTemplateRows: `repeat(${rows}, ${pitch}px)`,
				}}
			>
				{Array.from({ length: cols * rows }, (_, i) => (
					<div
						className="bg-background p-[3px] will-change-transform"
						data-cell
						// biome-ignore lint/suspicious/noArrayIndexKey: a fixed grid of identical cells
						key={i}
					>
						<div className="size-full rounded-[4px]" data-square />
					</div>
				))}
			</div>
		</div>
	);
}
