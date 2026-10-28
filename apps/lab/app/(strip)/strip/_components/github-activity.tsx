"use client";

import {
	type CSSProperties,
	type FocusEvent,
	type KeyboardEvent,
	type PointerEvent,
	type SyntheticEvent,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { withBase } from "@/lib/base";
import {
	type ActivityDay,
	type ActivityYear,
	activityCells,
	MONTH_DAYS,
	MONTHS,
	monthLength,
} from "@/lib/github-activity";
import { LINKS } from "@/lib/profile";
import { playSfx } from "@/lib/sfx";
import { gsap, reducedMotion, useGSAP } from "../_lib/gsap";
import { ExternalLink } from "./external-link";

const number = new Intl.NumberFormat("en-US");
const dateLabel = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "short",
	timeZone: "UTC",
});
const MONTH_LABELS = [
	"jan",
	"feb",
	"mar",
	"apr",
	"may",
	"jun",
	"jul",
	"aug",
	"sep",
	"oct",
	"nov",
	"dec",
] as const;
const DAY_STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 };
const MONTH_STEPS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };
/* a new year washes across the board on a diagonal: each row starts a
   little after the one above. activity.css counts the same steps */
const ROW_SLANT = 1.5;
/* how far a drag or swipe has to travel, mostly sideways, to change year */
const SWIPE_DISTANCE = 40;
const SWIPE_SLANT = 1.5;
/* the year slides in from the side it's coming from */
const YEAR_MOTION: Record<number, string> = { [-1]: "back", 1: "forward" };

const plural = (count: number) =>
	`${number.format(count)} ${count === 1 ? "contribution" : "contributions"}`;

const labelDay = (day: ActivityDay) =>
	`${plural(day.count)} on ${dateLabel.format(new Date(`${day.date}T00:00:00Z`))}`;

function ActivityBoard({
	activity,
	direction,
	month,
	onInspect,
	onSwipe,
}: {
	activity: ActivityYear;
	direction: number;
	/** the month row to label in ink */
	month: number | null;
	onInspect: (day: ActivityDay | null) => void;
	onSwipe: (step: number) => void;
}) {
	const boardRef = useRef<HTMLDivElement>(null);
	const swipe = useRef<{ x: number; y: number } | null>(null);
	const cells = useMemo(() => activityCells(activity), [activity]);
	const [focused, setFocused] = useState(0);
	const [shown, setShown] = useState(false);
	const today = new Date().toISOString().slice(0, 10);
	const lastDay = useMemo(
		() =>
			cells.reduce(
				(latest, { day }) =>
					day && day.date <= today ? Math.max(latest, day.index) : latest,
				0
			),
		[cells, today]
	);

	/* the dots fade up the first time the board is actually on screen */
	useEffect(() => {
		const board = boardRef.current;
		if (!board) {
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setShown(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.4 }
		);
		observer.observe(board);
		return () => observer.disconnect();
	}, []);

	const inspect = useCallback(
		(event: SyntheticEvent<HTMLButtonElement>) => {
			const { date, day } = event.currentTarget.dataset;
			const entry = activity.days[Number(day)];
			if (entry) {
				onInspect({ count: entry[0], date: date ?? "", level: entry[1] });
			}
		},
		[activity.days, onInspect]
	);
	const onFocus = useCallback(
		(event: FocusEvent<HTMLButtonElement>) => {
			setFocused(Number(event.currentTarget.dataset.day));
			inspect(event);
		},
		[inspect]
	);
	/* a mouse leaving the board puts the total back; a tap keeps its day
	   showing until the next one */
	const onPointerLeave = useCallback(
		(event: PointerEvent<HTMLFieldSetElement>) => {
			if (event.pointerType !== "touch") {
				onInspect(null);
			}
		},
		[onInspect]
	);
	/* focus leaving the board, not just moving along it, puts it back too */
	const onBlur = useCallback(
		(event: FocusEvent<HTMLButtonElement>) => {
			const next = event.relatedTarget;
			const grid = event.currentTarget.parentElement;
			if (!(next instanceof Node && grid?.contains(next))) {
				onInspect(null);
			}
		},
		[onInspect]
	);

	/** arrows walk day by day left and right, and month by month up and
	    down (landing on the month's last day when it's shorter) */
	const targetOf = useCallback(
		(key: string, cell: number, day: number) => {
			const dayStep = DAY_STEPS[key];
			if (dayStep) {
				return `[data-day="${day + dayStep}"]`;
			}
			const monthStep = MONTH_STEPS[key];
			if (monthStep) {
				const row = Math.floor(cell / MONTH_DAYS) + monthStep;
				if (row < 0 || row >= MONTHS) {
					return "";
				}
				const date = Math.min(
					cell % MONTH_DAYS,
					monthLength(activity.year, row) - 1
				);
				return `[data-cell="${row * MONTH_DAYS + date}"]`;
			}
			if (key === "Home") {
				return '[data-day="0"]';
			}
			return key === "End" ? `[data-day="${lastDay}"]` : null;
		},
		[activity.year, lastDay]
	);
	const onKeyDown = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>) => {
			const { cell, day } = event.currentTarget.dataset;
			const target = targetOf(event.key, Number(cell), Number(day));
			if (target === null) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			if (target) {
				boardRef.current
					?.querySelector<HTMLButtonElement>(`${target}:not(:disabled)`)
					?.focus({ preventScroll: true });
			}
		},
		[targetOf]
	);

	const startSwipe = useCallback((event: PointerEvent<HTMLDivElement>) => {
		if (event.pointerType === "mouse" && event.button !== 0) {
			return;
		}
		swipe.current = { x: event.clientX, y: event.clientY };
	}, []);
	const endSwipe = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			const start = swipe.current;
			swipe.current = null;
			if (!start || event.type === "pointercancel") {
				return;
			}
			const across = event.clientX - start.x;
			const down = event.clientY - start.y;
			if (
				Math.abs(across) >= SWIPE_DISTANCE &&
				Math.abs(across) >= Math.abs(down) * SWIPE_SLANT
			) {
				onSwipe(across < 0 ? 1 : -1);
			}
		},
		[onSwipe]
	);

	const tabbable = Math.min(focused, lastDay);

	return (
		<div
			className="ga-board"
			data-shown={shown ? "" : undefined}
			onPointerCancel={endSwipe}
			onPointerDown={startSwipe}
			onPointerUp={endSwipe}
			ref={boardRef}
		>
			<div aria-hidden="true" className="ga-months">
				{MONTH_LABELS.map((label, index) => (
					<span data-active={index === month ? "" : undefined} key={label}>
						{label}
					</span>
				))}
			</div>
			<div className="ga-field">
				<fieldset
					aria-label={`Daily GitHub contributions in ${activity.year}, one row per month. Use arrow keys to explore days.`}
					className="ga-grid"
					data-direction={direction < 0 ? "back" : undefined}
					onPointerLeave={onPointerLeave}
				>
					{cells.map(({ cell, day }) => {
						if (!day) {
							return <span className="ga-cell" key={cell} />;
						}
						const order =
							(cell % MONTH_DAYS) + Math.floor(cell / MONTH_DAYS) * ROW_SLANT;
						const future = day.date > today;
						return (
							<button
								aria-label={`${labelDay(day)}, ${activity.year}`}
								className="ga-cell"
								data-cell={cell}
								data-date={day.date}
								data-day={day.index}
								data-future={future ? "" : undefined}
								data-level={day.level}
								data-sfx="silent"
								data-today={day.date === today ? "" : undefined}
								disabled={future}
								key={cell}
								onBlur={onBlur}
								onClick={inspect}
								onFocus={onFocus}
								onKeyDown={onKeyDown}
								onPointerEnter={inspect}
								style={{ "--order": order } as CSSProperties}
								tabIndex={day.index === tabbable ? 0 : -1}
								type="button"
							/>
						);
					})}
				</fieldset>
			</div>
		</div>
	);
}

export function GithubActivity() {
	const rootRef = useRef<HTMLElement>(null);
	const countRef = useRef<HTMLSpanElement>(null);
	const shownCount = useRef(0);
	const id = useId();
	const [years, setYears] = useState<ActivityYear[]>([]);
	const [{ direction, index }, setView] = useState({ direction: 0, index: 0 });
	const [nearby, setNearby] = useState(false);
	const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
		"loading"
	);
	const [inspected, setInspected] = useState<ActivityDay | null>(null);
	/* the day stays written while it fades out */
	const [readout, setReadout] = useState<ActivityDay | null>(null);
	const activity = years[index];
	const total = activity?.total ?? 0;
	const thisYear = new Date().getUTCFullYear();
	const inspectedMonth = inspected
		? Number(inspected.date.slice(5, 7)) - 1
		: null;
	const currentMonth =
		activity?.year === thisYear ? new Date().getUTCMonth() : null;

	useEffect(() => {
		const root = rootRef.current;
		if (!root) {
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setNearby(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "320px" }
		);
		observer.observe(root);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!nearby || loadState !== "loading") {
			return;
		}
		const controller = new AbortController();
		const load = async () => {
			try {
				const response = await fetch(withBase("/api/github-activity"), {
					signal: controller.signal,
				});
				if (!response.ok) {
					throw new Error("GitHub activity couldn't load");
				}
				const data = (await response.json()) as { years: ActivityYear[] };
				if (!data.years.length) {
					throw new Error("GitHub activity is empty");
				}
				if (!controller.signal.aborted) {
					setView({ direction: 0, index: data.years.length - 1 });
					setYears(data.years);
					setLoadState("ready");
				}
			} catch {
				if (!controller.signal.aborted) {
					setLoadState("error");
				}
			}
		};
		load();
		return () => controller.abort();
	}, [nearby, loadState]);

	useEffect(() => {
		if (activity) {
			setInspected(null);
		}
	}, [activity]);

	useGSAP(
		() => {
			const count = countRef.current;
			if (!(count && years.length)) {
				return;
			}
			if (reducedMotion()) {
				count.textContent = number.format(total);
				shownCount.current = total;
				return;
			}
			const value = { count: shownCount.current };
			gsap.to(value, {
				count: total,
				duration: 0.9,
				ease: "power2.out",
				onUpdate: () => {
					shownCount.current = value.count;
					count.textContent = number.format(Math.round(value.count));
				},
			});
		},
		{
			dependencies: [total, years.length],
			revertOnUpdate: true,
			scope: rootRef,
		}
	);

	const goTo = useCallback(
		(target: number) => {
			const clamped = Math.max(0, Math.min(years.length - 1, target));
			setView((view) =>
				clamped === view.index
					? view
					: { direction: Math.sign(clamped - view.index), index: clamped }
			);
		},
		[years.length]
	);
	const previous = useCallback(() => goTo(index - 1), [goTo, index]);
	const next = useCallback(() => goTo(index + 1), [goTo, index]);
	const onSwipe = useCallback(
		(step: number) => {
			const target = index + step;
			if (target >= 0 && target < years.length) {
				playSfx("switch");
				goTo(target);
			}
		},
		[goTo, index, years.length]
	);
	const onInspect = useCallback((day: ActivityDay | null) => {
		setInspected(day);
		if (day) {
			setReadout(day);
		}
	}, []);
	const retry = useCallback(() => setLoadState("loading"), []);

	return (
		<section
			aria-labelledby={`${id}-title`}
			className="github-activity"
			ref={rootRef}
		>
			<div className="ga-heading">
				<h3 className="ga-label" id={`${id}-title`}>
					<ExternalLink className="ga-profile" href={LINKS.github}>
						github activity<span aria-hidden="true">↗</span>
					</ExternalLink>
				</h3>
				{activity ? (
					<div className="ga-years">
						<button
							aria-label="Previous year"
							className="ga-arrow"
							disabled={index === 0}
							onClick={previous}
							type="button"
						>
							←
						</button>
						<span
							className="ga-year"
							data-direction={YEAR_MOTION[direction]}
							key={activity.year}
						>
							{activity.year}
						</span>
						<button
							aria-label="Next year"
							className="ga-arrow"
							disabled={index === years.length - 1}
							onClick={next}
							type="button"
						>
							→
						</button>
					</div>
				) : null}
			</div>
			<span aria-atomic="true" aria-live="polite" className="sr-only">
				{activity
					? `${plural(total)} in ${activity.year}`
					: "Loading GitHub activity"}
			</span>
			{activity ? (
				<>
					<ActivityBoard
						activity={activity}
						direction={direction}
						month={inspectedMonth ?? currentMonth}
						onInspect={onInspect}
						onSwipe={onSwipe}
					/>
					<p
						aria-hidden="true"
						className="ga-status"
						data-inspecting={inspected ? "" : undefined}
					>
						<span className="ga-status-total">
							<span className="ga-total" ref={countRef}>
								{number.format(total)}
							</span>{" "}
							{total === 1 ? "contribution" : "contributions"}
						</span>
						<span className="ga-status-day">
							{readout ? labelDay(readout) : ""}
						</span>
					</p>
				</>
			) : (
				<div className="ga-placeholder">
					<p role="status">
						{loadState === "error"
							? "activity couldn't load"
							: "loading the green squares…"}
					</p>
					{loadState === "error" ? (
						<button className="ga-retry" onClick={retry} type="button">
							try again
						</button>
					) : null}
				</div>
			)}
		</section>
	);
}
