"use client";

// adapted from magic ui's animated-grid-pattern (magicui.design)
import { motion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { BackgroundProps } from "./types";

const CELL = 44;
const SQUARE_COUNT = 36;
const MAX_OPACITY = 0.5;
const FADE_SECONDS = 3.5;
const HOLD_SECONDS = 0.6;
const START_STAGGER_SECONDS = 0.12;

interface Square {
	column: number;
	id: number;
	/** bumps each time the square moves, so framer replays its fade */
	round: number;
	row: number;
}

const place = (columns: number, rows: number) => ({
	column: Math.floor(Math.random() * columns),
	row: Math.floor(Math.random() * rows),
});

function LitSquare({
	index,
	onDone,
	square,
	still,
}: {
	index: number;
	onDone: (id: number) => void;
	square: Square;
	still: boolean;
}) {
	const handleComplete = useCallback(
		() => onDone(square.id),
		[onDone, square.id]
	);
	const x = square.column * CELL + 1;
	const y = square.row * CELL + 1;

	if (still) {
		return (
			<rect
				fill="currentColor"
				height={CELL - 1}
				opacity={MAX_OPACITY * (0.3 + ((index * 37) % 70) / 100)}
				width={CELL - 1}
				x={x}
				y={y}
			/>
		);
	}

	return (
		<motion.rect
			animate={{ opacity: MAX_OPACITY }}
			fill="currentColor"
			height={CELL - 1}
			initial={{ opacity: 0 }}
			onAnimationComplete={handleComplete}
			transition={{
				delay: square.round === 0 ? index * START_STAGGER_SECONDS : 0,
				duration: FADE_SECONDS,
				repeat: 1,
				repeatDelay: HOLD_SECONDS,
				repeatType: "reverse",
			}}
			width={CELL - 1}
			x={x}
			y={y}
		/>
	);
}

/** a faint grid with squares fading up and away at random */
export function Squares({ still }: BackgroundProps) {
	const patternId = useId();
	const svgRef = useRef<SVGSVGElement>(null);
	const [grid, setGrid] = useState({ columns: 0, rows: 0 });
	const [squares, setSquares] = useState<Square[]>([]);

	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) {
			return;
		}
		const observer = new ResizeObserver(([entry]) => {
			if (!entry) {
				return;
			}
			const columns = Math.ceil(entry.contentRect.width / CELL);
			const rows = Math.ceil(entry.contentRect.height / CELL);
			setGrid((current) =>
				current.columns === columns && current.rows === rows
					? current
					: { columns, rows }
			);
		});
		observer.observe(svg);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!(grid.columns && grid.rows)) {
			return;
		}
		setSquares(
			Array.from({ length: SQUARE_COUNT }, (_, id) => ({
				id,
				round: 0,
				...place(grid.columns, grid.rows),
			}))
		);
	}, [grid]);

	const move = useCallback(
		(id: number) => {
			setSquares((current) =>
				current.map((square) =>
					square.id === id
						? {
								...square,
								round: square.round + 1,
								...place(grid.columns, grid.rows),
							}
						: square
				)
			);
		},
		[grid]
	);

	return (
		<svg aria-hidden="true" className="fx-squares" ref={svgRef}>
			<defs>
				<pattern
					height={CELL}
					id={patternId}
					patternUnits="userSpaceOnUse"
					width={CELL}
					x={-1}
					y={-1}
				>
					<path d={`M.5 ${CELL}V.5H${CELL}`} fill="none" />
				</pattern>
			</defs>
			<rect fill={`url(#${patternId})`} height="100%" width="100%" />
			<g className="fx-squares-lit">
				{squares.map((square, index) => (
					<LitSquare
						index={index}
						key={`${square.id}-${square.round}`}
						onDone={move}
						square={square}
						still={still}
					/>
				))}
			</g>
		</svg>
	);
}
