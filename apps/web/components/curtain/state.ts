/**
 * Shared bits of the site curtain (components/curtain/site-curtain.tsx):
 * the first visit's pre-hydration cover, and a way for code to navigate
 * behind the curtain the way links do.
 */

/** on <html> while the plain pre-hydration cover is up (see site.css) */
const ATTRIBUTE = "data-curtain";
const GO_EVENT = "curtain:go";

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** sessionStorage key: the intro has played this visit */
export const SEEN_KEY = "stormej.curtain";

export interface GoDetail {
	/** set by the curtain when it takes the navigation */
	handled: boolean;
	href: string;
}

/** the intro is due: the pre-hydration script has put the cover up */
export function introPending(): boolean {
	return document.documentElement.getAttribute(ATTRIBUTE) === "intro";
}

/** the intro's own columns are up: the plain cover can go */
export function clearPreCover() {
	document.documentElement.removeAttribute(ATTRIBUTE);
}

/**
 * Navigate behind the curtain from code (links are caught on their own).
 * Returns false when the curtain passes, e.g. under reduced motion, and the
 * caller should navigate as usual.
 */
export function curtainGo(href: string): boolean {
	const event = new CustomEvent<GoDetail>(GO_EVENT, {
		detail: { handled: false, href },
	});
	window.dispatchEvent(event);
	return event.detail.handled;
}

export function onGo(handler: (detail: GoDetail) => void): () => void {
	const listener = (event: Event) => {
		handler((event as CustomEvent<GoDetail>).detail);
	};
	window.addEventListener(GO_EVENT, listener);
	return () => window.removeEventListener(GO_EVENT, listener);
}

/**
 * Painted before hydration on a first visit to the home page: if the intro
 * will play, a plain cover goes up at once so the page never flashes first.
 * Reduced motion, a repeat visit or any other page skips it.
 */
export const PRE_COVER_SCRIPT = `try{if(location.pathname==="/"&&!sessionStorage.getItem("${SEEN_KEY}")&&!matchMedia("${REDUCED_MOTION}").matches){document.documentElement.setAttribute("${ATTRIBUTE}","intro")}}catch(e){}`;
