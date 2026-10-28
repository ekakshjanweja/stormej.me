export interface ActivityYear {
	/** January 1 onward, with each day's count and GitHub intensity. */
	days: [count: number, level: number][];
	total: number;
	year: number;
}

export interface ActivityDay {
	count: number;
	date: string;
	level: number;
}

interface CalendarDay extends ActivityDay {
	index: number;
	outside: boolean;
}

interface ContributionsResponse {
	contributions: ActivityDay[];
	total: Record<string, number>;
}

const DAY_MS = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const YEAR = /^\d{4}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const isDay = (value: unknown): value is ActivityDay =>
	isRecord(value) &&
	typeof value.date === "string" &&
	ISO_DATE.test(value.date) &&
	Number.isFinite(Date.parse(`${value.date}T00:00:00Z`)) &&
	typeof value.count === "number" &&
	Number.isInteger(value.count) &&
	value.count >= 0 &&
	typeof value.level === "number" &&
	Number.isInteger(value.level) &&
	value.level >= 0 &&
	value.level <= 4;

const isResponse = (value: unknown): value is ContributionsResponse =>
	isRecord(value) &&
	isRecord(value.total) &&
	Object.entries(value.total).every(
		([year, total]) =>
			YEAR.test(year) &&
			typeof total === "number" &&
			Number.isInteger(total) &&
			total >= 0
	) &&
	Array.isArray(value.contributions) &&
	value.contributions.every(isDay);

/** Keep dates out of the response payload: the client reconstructs them
    from the year, including leap days, without relying on its time zone. */
export const parseActivity = (value: unknown): ActivityYear[] => {
	if (!isResponse(value) || value.contributions.length === 0) {
		throw new Error("GitHub returned an invalid contribution history");
	}
	const byDate = new Map(value.contributions.map((day) => [day.date, day]));
	return Object.entries(value.total)
		.sort(([left], [right]) => Number(left) - Number(right))
		.map(([key, total]) => {
			const year = Number(key);
			const start = Date.UTC(year, 0, 1);
			const length = (Date.UTC(year + 1, 0, 1) - start) / DAY_MS;
			const days = Array.from({ length }, (_, index): [number, number] => {
				const date = new Date(start + index * DAY_MS)
					.toISOString()
					.slice(0, 10);
				const day = byDate.get(date);
				if (!day) {
					throw new Error(`GitHub contribution history is missing ${date}`);
				}
				return [day.count, day.level];
			});
			return { days, total, year };
		});
};

/** Weeks start on Sunday, like GitHub's contribution calendar. */
export const activityWeeks = (activity: ActivityYear): CalendarDay[][] => {
	const start = Date.UTC(activity.year, 0, 1);
	const offset = new Date(start).getUTCDay();
	const length = Math.ceil((offset + activity.days.length) / 7);
	return Array.from({ length }, (_week, week) =>
		Array.from({ length: 7 }, (_day, weekday) => {
			const index = week * 7 + weekday - offset;
			const day = activity.days[index];
			return {
				count: day?.[0] ?? 0,
				date: new Date(start + index * DAY_MS).toISOString().slice(0, 10),
				index,
				level: day?.[1] ?? 0,
				outside: !day,
			};
		})
	);
};
