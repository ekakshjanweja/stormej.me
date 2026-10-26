/* small formatting helpers, in the site's lowercase voice */

const MONTHS = [
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
];

/** "2026-04-28" → "28 apr 2026" */
export const dayMonthYear = (iso: string) => {
	const [year, month, day] = iso.split("-").map(Number);
	return `${day} ${MONTHS[(month ?? 1) - 1]} ${year}`;
};

/** 3 → "03" */
export const pad = (value: number) => String(value).padStart(2, "0");

const PROTOCOL = /^https?:\/\/(www\.)?/;
const TRAILING_SLASH = /\/$/;

/** "https://github.com/ekakshjanweja" → "github.com/ekakshjanweja" */
export const bareUrl = (href: string) =>
	href.replace(PROTOCOL, "").replace(TRAILING_SLASH, "");
