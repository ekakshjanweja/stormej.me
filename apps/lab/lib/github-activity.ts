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

export interface CalendarDay extends ActivityDay {
	/** days since January 1 */
	index: number;
}

export interface BoardCell {
	/** row-major position on a board of 12 months by 31 days */
	cell: number;
	/** null where a month runs out of days */
	day: CalendarDay | null;
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

export const MONTHS = 12;
export const MONTH_DAYS = 31;

export const monthLength = (year: number, month: number) =>
	(Date.UTC(year, month + 1, 1) - Date.UTC(year, month, 1)) / DAY_MS;

/** One row per month and one column per day of the month, so the 31st
    lines up under the 31st. Short months leave empty cells at the end. */
export const activityCells = (activity: ActivityYear): BoardCell[] => {
	const start = Date.UTC(activity.year, 0, 1);
	return Array.from({ length: MONTHS * MONTH_DAYS }, (_cell, cell) => {
		const month = Math.floor(cell / MONTH_DAYS);
		const date = cell % MONTH_DAYS;
		if (date >= monthLength(activity.year, month)) {
			return { cell, day: null };
		}
		const time = Date.UTC(activity.year, month, date + 1);
		const index = (time - start) / DAY_MS;
		const day = activity.days[index];
		return {
			cell,
			day: {
				count: day?.[0] ?? 0,
				date: new Date(time).toISOString().slice(0, 10),
				index,
				level: day?.[1] ?? 0,
			},
		};
	});
};
