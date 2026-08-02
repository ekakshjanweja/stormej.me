"use client";

import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	type Activity,
	ContributionGraph,
	ContributionGraphBlock,
	ContributionGraphCalendar,
	ContributionGraphFooter,
	ContributionGraphLegend,
	ContributionGraphTotalCount,
} from "@/components/kibo-ui/contribution-graph";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ContributionActivity } from "@/lib/contributions";
import { selectYearContributions } from "@/lib/contributions";
import { cn } from "@/lib/utils";

interface DayCommit {
	message: string;
	repo: string;
	sha: string;
	url: string;
}

interface ContributionsGraphClientProps {
	contributions: ContributionActivity[];
	defaultYear: number;
	totalsByYear: Record<number, number>;
	years: number[];
}

interface YearSwitcherProps {
	canGoToNextYear: boolean;
	canGoToPreviousYear: boolean;
	className?: string;
	onNextYear: () => void;
	onPreviousYear: () => void;
	year: number;
}

const commitCache = new Map<string, DayCommit[]>();

const fetchDayCommits = async (date: string): Promise<DayCommit[]> => {
	if (commitCache.has(date)) {
		return commitCache.get(date) ?? [];
	}

	const response = await fetch(`/api/contributions/commits?date=${date}`);

	if (!response.ok) {
		return [];
	}

	const data = (await response.json()) as { commits: DayCommit[] };
	commitCache.set(date, data.commits);
	return data.commits;
};

const YearSwitcher = ({
	canGoToNextYear,
	canGoToPreviousYear,
	className,
	onNextYear,
	onPreviousYear,
	year,
}: YearSwitcherProps) => (
	<div className={cn("inline-flex items-center gap-1", className)}>
		<button
			aria-label="Previous year"
			className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
			disabled={!canGoToPreviousYear}
			onClick={onPreviousYear}
			type="button"
		>
			<ChevronLeft className="size-4" />
		</button>
		<span className="meta-tag min-w-[3ch] text-center">{year}</span>
		<button
			aria-label="Next year"
			className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
			disabled={!canGoToNextYear}
			onClick={onNextYear}
			type="button"
		>
			<ChevronRight className="size-4" />
		</button>
	</div>
);

const DayTooltip = ({
	activity,
	dayIndex,
	weekIndex,
}: {
	activity: Activity;
	dayIndex: number;
	weekIndex: number;
}) => {
	const [commits, setCommits] = useState<DayCommit[] | null>(null);
	const [loading, setLoading] = useState(false);

	const loadCommits = useCallback(async () => {
		if (activity.count === 0 || commits !== null) {
			return;
		}

		setLoading(true);

		try {
			const nextCommits = await fetchDayCommits(activity.date);
			setCommits(nextCommits);
		} finally {
			setLoading(false);
		}
	}, [activity.count, activity.date, commits]);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (open) {
				loadCommits();
			}
		},
		[loadCommits]
	);

	const formattedDate = format(parseISO(activity.date), "MMMM d, yyyy");
	const commitLabel = activity.count === 1 ? "contribution" : "contributions";

	return (
		<Tooltip onOpenChange={handleOpenChange}>
			<TooltipTrigger asChild>
				<g>
					<ContributionGraphBlock
						activity={activity}
						className="cursor-pointer transition-opacity hover:opacity-90"
						dayIndex={dayIndex}
						weekIndex={weekIndex}
					/>
				</g>
			</TooltipTrigger>
			<TooltipContent
				className="max-w-xs space-y-2 px-3 py-2 text-xs"
				side="top"
			>
				<p className="font-medium text-popover-foreground">
					{activity.count === 0 ? "No" : activity.count} {commitLabel} on{" "}
					{formattedDate}
				</p>

				{activity.count > 0 && loading ? (
					<p className="text-muted-foreground">Loading commits…</p>
				) : null}

				{activity.count > 0 && commits && commits.length > 0 ? (
					<ul className="space-y-1.5">
						{commits.slice(0, 8).map((commit) => (
							<li key={`${commit.url}-${commit.sha}`}>
								<a
									className="block rounded-sm transition-colors hover:text-foreground"
									href={commit.url}
									rel="noopener noreferrer"
									target="_blank"
								>
									<span className="text-muted-foreground">{commit.repo}</span>
									<span className="mx-1 text-muted-foreground/60">·</span>
									<span className="line-clamp-2">{commit.message}</span>
								</a>
							</li>
						))}
						{commits.length > 8 ? (
							<li className="text-muted-foreground">
								+ {commits.length - 8} more commit
								{commits.length - 8 === 1 ? "" : "s"}
							</li>
						) : null}
					</ul>
				) : null}

				{activity.count > 0 && commits && commits.length === 0 ? (
					<p className="text-muted-foreground">
						No public commits found for this day. Activity may include pull
						requests, issues, or private repos.
					</p>
				) : null}
			</TooltipContent>
		</Tooltip>
	);
};

export const ContributionsGraphClient = ({
	contributions,
	defaultYear,
	totalsByYear,
	years,
}: ContributionsGraphClientProps) => {
	const [year, setYear] = useState(defaultYear);
	const calendarScrollRef = useRef<HTMLDivElement>(null);

	const yearData = useMemo(
		() => selectYearContributions(contributions, year),
		[contributions, year]
	);

	useEffect(() => {
		const calendar = calendarScrollRef.current;

		if (!calendar) {
			return;
		}

		const isMobile = window.matchMedia("(max-width: 639px)").matches;

		if (isMobile) {
			calendar.scrollLeft = calendar.scrollWidth;
		}
	}, [year]);

	const yearIndex = years.indexOf(year);
	const canGoToPreviousYear = yearIndex < years.length - 1;
	const canGoToNextYear = yearIndex > 0;

	const goToPreviousYear = () => {
		if (canGoToPreviousYear) {
			setYear(years[yearIndex + 1] as number);
		}
	};

	const goToNextYear = () => {
		if (canGoToNextYear) {
			setYear(years[yearIndex - 1] as number);
		}
	};

	if (contributions.length === 0) {
		return (
			<div className="rounded-xl border border-border bg-card/60 p-4 text-muted-foreground text-sm">
				Contribution data is taking a breather—try again shortly.
			</div>
		);
	}

	const totalForYear = totalsByYear[year] ?? 0;

	return (
		<TooltipProvider delayDuration={100}>
			<ContributionGraph
				className={cn("contribution-grid text-[11px] text-muted-foreground")}
				data={yearData}
				totalCount={totalForYear}
			>
				<div
					className="max-sm:-mx-4 max-sm:overflow-x-auto max-sm:px-4"
					ref={calendarScrollRef}
				>
					<ContributionGraphCalendar className="[&>svg]:!h-auto max-sm:[&>svg]:!w-auto sm:[&>svg]:!w-full pb-2 max-sm:overflow-visible max-sm:overflow-y-visible sm:overflow-hidden">
						{({ activity, dayIndex, weekIndex }) => (
							<DayTooltip
								activity={activity}
								dayIndex={dayIndex}
								key={`${activity.date}-${weekIndex}-${dayIndex}`}
								weekIndex={weekIndex}
							/>
						)}
					</ContributionGraphCalendar>
				</div>

				<ContributionGraphFooter className="flex flex-col gap-2.5 text-[11px] text-muted-foreground sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
					<div className="flex w-full items-center justify-between gap-3 sm:contents">
						<ContributionGraphTotalCount>
							{({ totalCount }) => (
								<span className="min-w-0 truncate">
									{totalCount.toLocaleString()} contributions in {year}
								</span>
							)}
						</ContributionGraphTotalCount>

						<YearSwitcher
							canGoToNextYear={canGoToNextYear}
							canGoToPreviousYear={canGoToPreviousYear}
							className="shrink-0 sm:justify-self-center"
							onNextYear={goToNextYear}
							onPreviousYear={goToPreviousYear}
							year={year}
						/>
					</div>

					<ContributionGraphLegend className="mr-auto ml-0 gap-0.5 text-[9px] sm:mr-0 sm:gap-[3px] sm:justify-self-end sm:text-[11px]">
						{({ level }) => (
							<div
								className={cn(
									"legend-block h-2 w-2 rounded-[2px] sm:h-3 sm:w-3 sm:rounded-sm"
								)}
								data-level={level}
							/>
						)}
					</ContributionGraphLegend>
				</ContributionGraphFooter>
			</ContributionGraph>
		</TooltipProvider>
	);
};
