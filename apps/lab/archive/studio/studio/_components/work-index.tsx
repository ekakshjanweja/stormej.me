"use client";

import Image from "next/image";
import {
	type FocusEvent,
	type MouseEvent,
	type PointerEvent,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { gsap, isTouch, reducedMotion } from "../_lib/gsap";
import { type GroupId, pad, WORK_GROUPS, type WorkEntry } from "../_lib/pages";
import { sizeOf } from "../_lib/sizes";
import { NEW_TAB } from "./external-link";
import { StudioLink } from "./studio-link";
import { When } from "./when";

/* every case and the archive as one long editorial list. a filter narrows
   it to a group; on a mouse, a preview of each row (its first screen, or
   its biggest number when there's no screen) trails the cursor, and the
   other rows step back. keyboard focus parks the same preview beside the
   row. touch gets a small thumbnail in each row instead */

type Filter = "all" | GroupId;

const TOTAL = WORK_GROUPS.reduce((sum, group) => sum + group.entries.length, 0);

const FILTERS: { count: number; id: Filter; label: string }[] = [
	{ count: TOTAL, id: "all", label: "all" },
	...WORK_GROUPS.map((group) => ({
		count: group.entries.length,
		id: group.id,
		label: group.label,
	})),
];

/* one running number down the whole list */
const NUMBERS = new Map(
	WORK_GROUPS.flatMap((group) => group.entries).map((entry, index) => [
		entry.slug,
		index + 1,
	])
);

const ENTRIES = WORK_GROUPS.flatMap((group) => group.entries);

const PREVIEW_GAP = 28;

function RowBody({ entry }: { entry: WorkEntry }) {
	return (
		<>
			<span aria-hidden="true" className="index-row-number">
				{pad(NUMBERS.get(entry.slug) ?? 0)}
			</span>
			<span className="index-row-title">{entry.title}</span>
			<span className="index-row-detail">{entry.detail}</span>
			<span className="index-row-when">
				<When value={entry.when} />
			</span>
			<span aria-hidden="true" className="index-row-arrow">
				{entry.external ? "↗" : "→"}
			</span>
			{entry.image ? (
				<span aria-hidden="true" className="index-row-thumb">
					<Image alt="" height={96} src={entry.image} width={72} />
				</span>
			) : null}
		</>
	);
}

function Row({
	entry,
	onBlur,
	onFocus,
	onEnter,
}: {
	entry: WorkEntry;
	onBlur: () => void;
	onEnter: (event: PointerEvent<HTMLLIElement>) => void;
	onFocus: (event: FocusEvent<HTMLAnchorElement>) => void;
}) {
	return (
		<li className="index-row" data-slug={entry.slug} onPointerEnter={onEnter}>
			{entry.external ? (
				<a
					className="index-row-link"
					href={entry.href}
					onBlur={onBlur}
					onFocus={onFocus}
					rel="noopener noreferrer"
					target="_blank"
				>
					<RowBody entry={entry} />
					<span className="sr-only"> (on stormej.me, {NEW_TAB})</span>
				</a>
			) : (
				<StudioLink
					className="index-row-link"
					href={entry.href}
					onBlur={onBlur}
					onFocus={onFocus}
				>
					<RowBody entry={entry} />
				</StudioLink>
			)}
		</li>
	);
}

function PreviewItem({ entry }: { entry: WorkEntry }) {
	if (entry.image) {
		const [width, height] = sizeOf(entry.image);
		return (
			<div
				className={`index-preview-item is-${entry.shape}`}
				data-slug={entry.slug}
			>
				<Image
					alt=""
					height={height}
					sizes="320px"
					src={entry.image}
					width={width}
				/>
			</div>
		);
	}
	return (
		<div className="index-preview-item is-type" data-slug={entry.slug}>
			<span className="index-preview-metric">{entry.metric}</span>
			<span className="index-preview-label">{entry.metricLabel}</span>
		</div>
	);
}

export function WorkIndex() {
	const [filter, setFilter] = useState<Filter>("all");
	const listRef = useRef<HTMLDivElement>(null);
	const previewRef = useRef<HTMLDivElement>(null);
	const follow = useRef<{
		x: (value: number) => void;
		y: (value: number) => void;
	} | null>(null);
	const active = useRef<string | null>(null);
	const firstFilter = useRef(true);

	const visible = WORK_GROUPS.filter(
		(group) => filter === "all" || group.id === filter
	);
	const shown = visible.reduce((sum, group) => sum + group.entries.length, 0);

	useEffect(() => {
		const preview = previewRef.current;
		if (!preview || isTouch()) {
			return;
		}
		const duration = reducedMotion() ? 0 : 0.55;
		follow.current = {
			x: gsap.quickTo(preview, "x", { duration, ease: "power3" }),
			y: gsap.quickTo(preview, "y", { duration, ease: "power3" }),
		};
		return () => {
			follow.current = null;
			gsap.killTweensOf(preview);
		};
	}, []);

	/** shows the preview for `slug` with its top left at (x, y) */
	const show = useCallback((slug: string, x: number, y: number) => {
		const preview = previewRef.current;
		if (!(preview && follow.current)) {
			return;
		}
		if (active.current !== slug) {
			active.current = slug;
			for (const item of preview.querySelectorAll<HTMLElement>(
				".index-preview-item"
			)) {
				item.classList.toggle("is-active", item.dataset.slug === slug);
			}
		}
		const item = preview.querySelector<HTMLElement>(
			".index-preview-item.is-active"
		);
		const width = item?.offsetWidth ?? 0;
		const height = item?.offsetHeight ?? 0;
		const left = Math.min(x, window.innerWidth - width - 16);
		const top = Math.min(
			Math.max(y - height / 2, 16),
			window.innerHeight - height - 16
		);
		if (preview.dataset.state !== "on") {
			/* appear in place, then follow */
			gsap.set(preview, { x: left, y: top });
		}
		follow.current.x(left);
		follow.current.y(top);
		preview.dataset.state = "on";
	}, []);

	const hide = useCallback(() => {
		const preview = previewRef.current;
		if (preview) {
			preview.dataset.state = "off";
		}
	}, []);

	const onMove = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			if (active.current && previewRef.current?.dataset.state === "on") {
				show(active.current, event.clientX + PREVIEW_GAP, event.clientY);
			}
		},
		[show]
	);

	const onEnter = useCallback(
		(event: PointerEvent<HTMLLIElement>) => {
			if (event.pointerType !== "mouse") {
				return;
			}
			const { slug } = event.currentTarget.dataset;
			if (slug) {
				show(slug, event.clientX + PREVIEW_GAP, event.clientY);
			}
		},
		[show]
	);

	const onFocus = useCallback(
		(event: FocusEvent<HTMLAnchorElement>) => {
			const row = event.currentTarget.closest<HTMLElement>(".index-row");
			const slug = row?.dataset.slug;
			if (!(row && slug && event.currentTarget.matches(":focus-visible"))) {
				return;
			}
			const rect = row.getBoundingClientRect();
			show(slug, rect.right - 420, rect.top + rect.height / 2);
		},
		[show]
	);

	const onFilter = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		setFilter(event.currentTarget.dataset.filter as Filter);
	}, []);

	/* the rows that are left rise back in, quickly */
	// biome-ignore lint/correctness/useExhaustiveDependencies: filter is the trigger; the rows are read from the dom
	useLayoutEffect(() => {
		if (firstFilter.current) {
			firstFilter.current = false;
			return;
		}
		const list = listRef.current;
		if (!list || reducedMotion()) {
			return;
		}
		const rows = list.querySelectorAll(".index-group:not([hidden]) .index-row");
		const tween = gsap.fromTo(
			rows,
			{ opacity: 0, y: 28 },
			{
				clearProps: "opacity,transform",
				duration: 0.6,
				ease: "expo.out",
				opacity: 1,
				stagger: 0.025,
				y: 0,
			}
		);
		return () => {
			tween.kill();
		};
	}, [filter]);

	return (
		<section aria-label="the list" className="index-section">
			<div className="index-bar">
				<fieldset aria-label="filter the work" className="index-filters">
					{FILTERS.map((option) => (
						<button
							aria-pressed={filter === option.id}
							className="index-filter"
							data-filter={option.id}
							key={option.id}
							onClick={onFilter}
							type="button"
						>
							{option.label}
							<span aria-hidden="true" className="index-filter-count">
								{option.count}
							</span>
							<span className="sr-only">, {option.count}</span>
						</button>
					))}
				</fieldset>
				<p className="index-count" role="status">
					showing {shown} of {TOTAL}
				</p>
			</div>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: the move only steers a decorative preview */}
			{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: the move only steers a decorative preview */}
			<div
				className="index-groups"
				onMouseLeave={hide}
				onMouseMove={onMove}
				ref={listRef}
			>
				{WORK_GROUPS.map((group) => (
					<section
						aria-labelledby={`group-${group.id}`}
						className="index-group"
						hidden={!visible.includes(group)}
						key={group.id}
					>
						<div className="index-group-head">
							<h2 className="index-group-title" id={`group-${group.id}`}>
								{group.title}
							</h2>
							<p className="index-group-text">{group.text}</p>
						</div>
						<ol className="index-list">
							{group.entries.map((entry) => (
								<Row
									entry={entry}
									key={entry.slug}
									onBlur={hide}
									onEnter={onEnter}
									onFocus={onFocus}
								/>
							))}
						</ol>
					</section>
				))}
			</div>
			<div
				aria-hidden="true"
				className="index-preview"
				data-state="off"
				ref={previewRef}
			>
				{ENTRIES.map((entry) => (
					<PreviewItem entry={entry} key={entry.slug} />
				))}
			</div>
		</section>
	);
}
