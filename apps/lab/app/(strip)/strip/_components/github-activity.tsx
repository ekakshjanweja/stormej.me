"use client";

import {
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
	activityWeeks,
} from "@/lib/github-activity";
import { LINKS } from "@/lib/profile";
import { gsap, reducedMotion, useGSAP } from "../_lib/gsap";
import { ExternalLink } from "./external-link";

const number = new Intl.NumberFormat("en-US");
const dateLabel = new Intl.DateTimeFormat("en-US", {
	day: "numeric",
	month: "short",
	timeZone: "UTC",
});
const DAY_STEPS: Record<string, number> = {
	ArrowDown: 1,
	ArrowLeft: -7,
	ArrowRight: 7,
	ArrowUp: -1,
};
const DAY_MS = 86_400_000;

const labelDay = (day: ActivityDay) =>
	`${number.format(day.count)} ${day.count === 1 ? "contribution" : "contributions"} on ${dateLabel.format(new Date(`${day.date}T00:00:00Z`))}`;

function ActivityCalendar({
	active,
	activity,
	onInspect,
}: {
	active: boolean;
	activity: ActivityYear;
	onInspect: (day: ActivityDay | null) => void;
}) {
	const weeks = useMemo(() => activityWeeks(activity), [activity]);
	const [focused, setFocused] = useState(0);
	const today = new Date().toISOString().slice(0, 10);
	const lastDay = Math.min(
		activity.days.length - 1,
		Math.floor((Date.parse(today) - Date.UTC(activity.year, 0, 1)) / DAY_MS)
	);

	const inspect = useCallback(
		(event: SyntheticEvent<HTMLButtonElement>) => {
			if (!active) {
				return;
			}
			const button = event.currentTarget;
			const index = Number(button.dataset.day);
			const day = activity.days[index];
			if (day) {
				if (event.type !== "pointerenter") {
					setFocused(index);
				}
				onInspect({
					count: day[0],
					date: button.dataset.date ?? "",
					level: day[1],
				});
			}
		},
		[active, activity.days, onInspect]
	);
	const clear = useCallback(() => onInspect(null), [onInspect]);
	const onKeyDown = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>) => {
			const { currentTarget: target } = event;
			const step = DAY_STEPS[event.key];
			let index = Number(target.dataset.day);
			if (step) {
				index += step;
			} else if (event.key === "Home") {
				index = 0;
			} else if (event.key === "End") {
				index = lastDay;
			} else {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			const calendar = target.closest(".ga-calendar");
			calendar
				?.querySelector<HTMLButtonElement>(
					`[data-day="${index}"]:not(:disabled)`
				)
				?.focus({ preventScroll: true });
		},
		[lastDay]
	);

	return (
		<div className="ga-calendar">
			<fieldset
				aria-label={`Daily GitHub contributions in ${activity.year}. Use arrow keys to explore days.`}
				className="ga-grid"
			>
				{weeks.map((week, weekIndex) => (
					<div
						className="ga-week"
						key={week[0].date}
						style={{ transitionDelay: `${weekIndex * 1.5}ms` }}
					>
						{week.map((day) => {
							if (day.outside) {
								return <span className="ga-day ga-empty" key={day.date} />;
							}
							const { index } = day;
							const future = day.date > today;
							return (
								<button
									aria-label={`${labelDay(day)}, ${activity.year}`}
									className="ga-day"
									data-date={day.date}
									data-day={index}
									data-future={future ? "" : undefined}
									data-level={day.level}
									disabled={future}
									key={day.date}
									onBlur={clear}
									onClick={inspect}
									onFocus={inspect}
									onKeyDown={onKeyDown}
									onPointerEnter={inspect}
									onPointerLeave={clear}
									tabIndex={active && index === focused ? 0 : -1}
									type="button"
								/>
							);
						})}
					</div>
				))}
			</fieldset>
			<div aria-hidden="true" className="ga-months">
				<span>jan</span>
				<span>apr</span>
				<span>jul</span>
				<span>oct</span>
				<span>dec</span>
			</div>
		</div>
	);
}

export function GithubActivity() {
	const rootRef = useRef<HTMLElement>(null);
	const trackRef = useRef<HTMLElement>(null);
	const railRef = useRef<HTMLElement>(null);
	const countRef = useRef<HTMLSpanElement>(null);
	const shownCount = useRef(0);
	const currentIndex = useRef(0);
	const drag = useRef<{ left: number; x: number } | null>(null);
	const moved = useRef(false);
	const id = useId();
	const [years, setYears] = useState<ActivityYear[]>([]);
	const [index, setIndex] = useState(0);
	const [nearby, setNearby] = useState(false);
	const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
		"loading"
	);
	const [inspected, setInspected] = useState<ActivityDay | null>(null);
	const activity = years[index];
	const total = activity?.total ?? 0;

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
					currentIndex.current = data.years.length - 1;
					setIndex(currentIndex.current);
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
		const track = trackRef.current;
		if (!(track && years.length)) {
			return;
		}
		const align = () => {
			track.scrollTo({
				behavior: "instant",
				left: currentIndex.current * track.clientWidth,
			});
		};
		align();
		const observer = new ResizeObserver(align);
		observer.observe(track);
		return () => observer.disconnect();
	}, [years]);

	useEffect(() => {
		setInspected(null);
		if (!activity) {
			return;
		}
		const rail = railRef.current;
		const button = rail?.querySelector<HTMLButtonElement>(
			`[data-year="${activity.year}"]`
		);
		if (rail && button) {
			rail.scrollTo({
				behavior: reducedMotion() ? "instant" : "smooth",
				left: button.offsetLeft - rail.clientWidth / 2 + button.offsetWidth / 2,
			});
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
				duration: 0.28,
				ease: "power3.out",
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
		(targetIndex: number, instant = false) => {
			const track = trackRef.current;
			if (track) {
				track.scrollTo({
					behavior: instant || reducedMotion() ? "instant" : "smooth",
					left:
						Math.max(0, Math.min(years.length - 1, targetIndex)) *
						track.clientWidth,
				});
			}
		},
		[years.length]
	);
	const previous = useCallback(() => goTo(currentIndex.current - 1), [goTo]);
	const next = useCallback(() => goTo(currentIndex.current + 1), [goTo]);
	const pick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			goTo(Number(event.currentTarget.dataset.index), event.detail === 0);
		},
		[goTo]
	);
	const onScroll = useCallback(() => {
		const track = trackRef.current;
		if (!track?.clientWidth) {
			return;
		}
		const nextIndex = Math.max(
			0,
			Math.min(
				years.length - 1,
				Math.round(track.scrollLeft / track.clientWidth)
			)
		);
		currentIndex.current = nextIndex;
		setIndex(nextIndex);
	}, [years.length]);
	const startDrag = useCallback((event: PointerEvent<HTMLElement>) => {
		if (event.pointerType !== "mouse" || event.button !== 0) {
			return;
		}
		drag.current = { left: event.currentTarget.scrollLeft, x: event.clientX };
		moved.current = false;
	}, []);
	const moveDrag = useCallback((event: PointerEvent<HTMLElement>) => {
		const start = drag.current;
		if (!start) {
			return;
		}
		const distance = event.clientX - start.x;
		if (Math.abs(distance) > 5) {
			moved.current = true;
			event.currentTarget.dataset.dragging = "";
			event.currentTarget.setPointerCapture(event.pointerId);
		}
		if (moved.current) {
			event.currentTarget.scrollLeft = start.left - distance;
		}
	}, []);
	const endDrag = useCallback(
		(event: PointerEvent<HTMLElement>) => {
			if (!drag.current) {
				return;
			}
			drag.current = null;
			delete event.currentTarget.dataset.dragging;
			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}
			if (moved.current) {
				goTo(
					Math.round(
						event.currentTarget.scrollLeft / event.currentTarget.clientWidth
					)
				);
			}
		},
		[goTo]
	);
	const retry = useCallback(() => setLoadState("loading"), []);

	return (
		<section
			aria-labelledby={`${id}-title`}
			className="github-activity"
			ref={rootRef}
		>
			<div className="ga-heading">
				<div>
					<h3 className="ga-label" id={`${id}-title`}>
						github activity
					</h3>
					<p className="ga-tally">
						<span aria-hidden="true" className="ga-total" ref={countRef}>
							{activity ? number.format(total) : "—"}
						</span>
						<span aria-hidden="true" className="ga-caption">
							contributions{activity ? ` in ${activity.year}` : ""}
						</span>
					</p>
					<span aria-atomic="true" aria-live="polite" className="sr-only">
						{activity
							? `${number.format(total)} contributions in ${activity.year}`
							: "Loading GitHub activity"}
					</span>
				</div>
				<ExternalLink
					aria-label="View ekaksh's GitHub profile"
					className="ga-profile"
					href={LINKS.github}
				>
					↗
				</ExternalLink>
			</div>
			{activity ? (
				<>
					<section
						aria-label="GitHub activity by year. Drag or swipe to explore."
						className="ga-track"
						data-lenis-prevent=""
						onPointerCancel={endDrag}
						onPointerDown={startDrag}
						onPointerMove={moveDrag}
						onPointerUp={endDrag}
						onScroll={onScroll}
						ref={trackRef}
					>
						{years.map((year, position) => (
							<div
								aria-hidden={position !== index}
								className="ga-page"
								data-active={position === index ? "" : undefined}
								key={year.year}
							>
								{Math.abs(position - index) <= 1 ? (
									<ActivityCalendar
										active={position === index}
										activity={year}
										onInspect={setInspected}
									/>
								) : null}
							</div>
						))}
					</section>
					<div className="ga-details">
						<p>
							{inspected ? labelDay(inspected) : "one green square at a time"}
						</p>
						<span
							aria-label="Contribution intensity from less to more"
							className="ga-legend"
							role="img"
						>
							{[0, 1, 2, 3, 4].map((level) => (
								<span className="ga-day" data-level={level} key={level} />
							))}
						</span>
					</div>
					<div className="ga-navigation">
						<button
							aria-label="Previous year"
							className="ga-arrow"
							disabled={index === 0}
							onClick={previous}
							type="button"
						>
							←
						</button>
						<nav
							aria-label="Choose a year"
							className="ga-year-rail"
							data-lenis-prevent=""
							ref={railRef}
						>
							{years.map((year, position) => (
								<button
									aria-label={`Show GitHub activity for ${year.year}`}
									aria-pressed={position === index}
									className="ga-year"
									data-index={position}
									data-year={year.year}
									key={year.year}
									onClick={pick}
									type="button"
								>
									{year.year}
								</button>
							))}
						</nav>
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
					<p className="ga-hint">drag or swipe through the years</p>
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
							try again ↗
						</button>
					) : null}
				</div>
			)}
		</section>
	);
}
