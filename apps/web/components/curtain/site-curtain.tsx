"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CurtainIntro } from "./curtain-intro";
import { CurtainTransition } from "./curtain-transition";
import {
	clearPreCover,
	introPending,
	onGo,
	REDUCED_MOTION,
	SEEN_KEY,
} from "./state";

/** routes that aren't pages (images, feeds, files) navigate as usual */
const NOT_A_PAGE = /^\/(api|og)(\/|$)|\.[a-z0-9]+$/i;
/** if a page never arrives, the curtain lifts anyway after this long */
const GIVE_UP_MS = 6000;

type Mode =
	| { kind: "intro" }
	| { kind: "go"; href: string; path: string }
	| null;

function samePath(a: string, b: string) {
	try {
		return decodeURI(a) === decodeURI(b);
	} catch {
		return a === b;
	}
}

/** a plain left click on a link, with nothing asking for a new tab */
function plainClick(event: MouseEvent) {
	return !(
		event.defaultPrevented ||
		event.button !== 0 ||
		event.metaKey ||
		event.ctrlKey ||
		event.shiftKey ||
		event.altKey
	);
}

/**
 * The curtain, site wide. A first visit to the home page opens on the
 * full intro; after that, following any link to another page drops a quick
 * curtain, swaps the page behind it and lifts it again. Links are caught on the way
 * down (capture phase), so next/link, MDX links and plain anchors all get
 * it; code can ask for it with curtainGo(). Reduced motion turns it off.
 */
export function SiteCurtain() {
	const router = useRouter();
	const pathname = usePathname();
	const [mode, setMode] = useState<Mode>(null);
	const [covered, setCovered] = useState(false);
	const [gaveUp, setGaveUp] = useState(false);
	/* a ref as well as the state, so a second click in the same tick sees it */
	const busy = useRef(false);

	useEffect(() => {
		if (!introPending()) {
			return;
		}
		try {
			sessionStorage.setItem(SEEN_KEY, "1");
		} catch {
			/* private mode: the intro may play again, nothing worse */
		}
		busy.current = true;
		setMode({ kind: "intro" });
	}, []);

	/** takes the navigation if it should; false leaves it to the browser */
	const start = useCallback((href: string): boolean => {
		if (busy.current || window.matchMedia(REDUCED_MOTION).matches) {
			return false;
		}
		const url = new URL(href, window.location.href);
		const leaving =
			url.origin === window.location.origin &&
			!samePath(url.pathname, window.location.pathname) &&
			!NOT_A_PAGE.test(url.pathname);
		if (!leaving) {
			return false;
		}
		busy.current = true;
		setMode({
			href: `${url.pathname}${url.search}${url.hash}`,
			kind: "go",
			path: url.pathname,
		});
		return true;
	}, []);

	useEffect(() => {
		const onClick = (event: MouseEvent) => {
			if (!plainClick(event)) {
				return;
			}
			const anchor = (event.target as Element | null)?.closest("a[href]");
			if (!(anchor instanceof HTMLAnchorElement)) {
				return;
			}
			const newTab = anchor.target !== "" && anchor.target !== "_self";
			if (newTab || anchor.hasAttribute("download")) {
				return;
			}
			if (start(anchor.href)) {
				event.preventDefault();
			}
		};
		document.addEventListener("click", onClick, true);
		const stopGo = onGo((detail) => {
			detail.handled = start(detail.href);
		});
		return () => {
			document.removeEventListener("click", onClick, true);
			stopGo();
		};
	}, [start]);

	const target = mode?.kind === "go" ? mode : null;

	const navigate = useCallback(() => {
		if (!target) {
			return;
		}
		setCovered(true);
		window.scrollTo({ behavior: "instant", top: 0 });
		router.push(target.href);
	}, [router, target]);

	useEffect(() => {
		if (!covered) {
			return;
		}
		const timer = window.setTimeout(() => setGaveUp(true), GIVE_UP_MS);
		return () => window.clearTimeout(timer);
	}, [covered]);

	const done = useCallback(() => {
		busy.current = false;
		clearPreCover();
		setCovered(false);
		setGaveUp(false);
		setMode(null);
	}, []);

	if (!mode) {
		return null;
	}

	if (mode.kind === "intro") {
		return createPortal(
			<CurtainIntro onCovered={clearPreCover} onDone={done} />,
			document.body
		);
	}

	const arrived = covered && (gaveUp || samePath(pathname, mode.path));

	return createPortal(
		<CurtainTransition
			key={mode.href}
			onCovered={navigate}
			onDone={done}
			path={mode.path}
			ready={arrived}
		/>,
		document.body
	);
}
