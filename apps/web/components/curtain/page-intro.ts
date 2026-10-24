import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrambleTextPlugin, SplitText);

const SCRAMBLE_CHARS = "abcdefghijklmnopqrstuvwxyz·";

interface IntroOptions {
	/** false when the loader lands the hero heading itself */
	heading?: boolean;
}

/**
 * The home page arriving once a loader lets go: the navbar drops in, the
 * eyebrow unscrambles, the hero rises word by word and the sections below
 * follow. Build it while the loader still covers the page (every from()
 * state applies at once, so nothing flashes), then place it on the loader's
 * timeline where the cover lifts. Splits and states undo themselves when the
 * loader's gsap context reverts.
 */
export function pageIntro({
	heading = true,
}: IntroOptions = {}): gsap.core.Timeline {
	const tl = gsap.timeline();

	/* plain document queries: inside a loader's context, gsap's own selector
	   helpers would only search the loader */
	const all = (selector: string) => [
		...document.querySelectorAll<HTMLElement>(selector),
	];
	const nav = document.querySelector<HTMLElement>(".site-nav");
	const eyebrow = document.querySelector<HTMLElement>(".hero-eyebrow");
	const ledes = all(".home-hero .hero-lede").filter(
		(el) => heading || el.id !== "hero-heading"
	);
	const actions = all(".home-hero > div:last-child > *");
	const sections = all(".home-stack > :not(.home-hero)");

	if (nav) {
		tl.from(
			nav,
			{ duration: 1, ease: "expo.out", opacity: 0, yPercent: -100 },
			0
		);
	}

	if (eyebrow) {
		const text = eyebrow.textContent ?? "";
		tl.fromTo(eyebrow, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0);
		tl.to(
			eyebrow,
			{
				duration: 1.1,
				ease: "none",
				scrambleText: { chars: SCRAMBLE_CHARS, revealDelay: 0.35, text },
			},
			0
		);
	}

	if (ledes.length > 0) {
		const split = SplitText.create(ledes, { mask: "words", type: "words" });
		tl.from(
			split.words,
			{
				duration: 1.1,
				ease: "expo.out",
				stagger: 0.022,
				yPercent: 110,
			},
			0.08
		);
	}

	if (actions.length > 0) {
		tl.from(
			actions,
			{ duration: 0.9, ease: "expo.out", opacity: 0, stagger: 0.08, y: 18 },
			0.35
		);
	}

	if (sections.length > 0) {
		tl.from(
			sections,
			{ duration: 1.2, ease: "expo.out", opacity: 0, stagger: 0.08, y: 56 },
			0.45
		);
	}

	return tl;
}

/** a token from globals.css as written there, e.g. "#3d6a4c" */
export function cssVar(name: string): string {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
}

/** how far down a lone wrapper is unwrapped to find the blocks to stagger */
const MAX_UNWRAP = 3;

/**
 * Any page arriving under the quick curtain: the blocks of the main column
 * rise in turn, briskly. A wrapper with a single child (a page's own <main>, the home
 * stack) is unwrapped first, so the stagger runs over the visible blocks.
 */
export function contentIntro(): gsap.core.Timeline {
	const tl = gsap.timeline();
	let blocks = [
		...(document.getElementById("main-content")?.children ?? []),
	] as HTMLElement[];
	for (let depth = 0; depth < MAX_UNWRAP && blocks.length === 1; depth += 1) {
		blocks = [...(blocks[0]?.children ?? [])] as HTMLElement[];
	}
	if (blocks.length > 0) {
		tl.from(blocks, {
			duration: 0.6,
			ease: "expo.out",
			opacity: 0,
			stagger: 0.035,
			y: 24,
		});
	}
	return tl;
}
