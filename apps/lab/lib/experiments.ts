/* the lab's table of contents. each experiment has its own root layout, so
   moving between them is a full page load and no styles leak across.
   strip is the one live experiment; orbit and studio are kept in archive/
   and listed here without links (see archive/README.md to bring one back) */

export interface Experiment {
	/** what it's after, credited */
	after: { href: string; label: string };
	href: string;
	/** a cover from public/media, shown on hover */
	image: string;
	/** every page the experiment has, home first */
	pages: { href: string; label: string }[];
	slug: string;
	summary: string;
	title: string;
}

export const EXPERIMENTS: Experiment[] = [
	{
		after: { href: "https://douglus.site/", label: "douglus.site" },
		href: "/strip",
		image: "/media/ig/DejyibXiKjs.webp",
		pages: [{ href: "/strip", label: "home" }],
		slug: "strip",
		summary:
			"a portfolio that runs sideways. a preloader, a curtain between pages, a cursor that leaves a sage wake, a photo you can drag.",
		title: "strip",
	},
];

/** an experiment that was tried and set aside; its code is in archive/ */
export type ArchivedExperiment = Pick<
	Experiment,
	"after" | "slug" | "summary" | "title"
>;

export const ARCHIVED: ArchivedExperiment[] = [
	{
		after: { href: "https://www.avivashishta.com/", label: "avivashishta.com" },
		slug: "orbit",
		summary:
			"one screen, no scroll. stand inside a ring of everything i've shipped, hung in a drawn delhi sky.",
		title: "orbit",
	},
	{
		after: { href: "https://incredibles.dev/", label: "incredibles.dev" },
		slug: "studio",
		summary:
			"a one-engineer studio page. a headline drawn in fluid, cards that stack in 3d, a trail of screenshots, a block that bounces off the words.",
		title: "studio",
	},
];
