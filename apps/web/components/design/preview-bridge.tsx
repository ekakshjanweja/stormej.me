"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { designAttributes, designCss } from "@/lib/design/css";
import {
	DEFAULT_DESIGN,
	type DesignConfig,
	effectiveDesign,
	normalizeDesign,
} from "@/lib/design/options";

export const PREVIEW_PARAM = "design-preview";

export interface DesignPreviewMessage {
	config: unknown;
	mode: "dark" | "light";
	type: "design-preview";
}

/** asks a preview frame to play its entrance animations again */
export interface DesignReplayMessage {
	type: "design-replay";
}

interface DesignContextValue {
	/** the design as it renders: motion "off" already applied */
	design: DesignConfig;
	/** bumps whenever the studio asks for a replay; key effects on it */
	replay: number;
}

const DesignContext = createContext<DesignContextValue>({
	design: DEFAULT_DESIGN,
	replay: 0,
});

/** the published design, or the studio's draft inside a preview frame */
export const useDesign = () => useContext(DesignContext);

/** the published hero copy, or the studio's draft inside a preview frame */
export const useHeroCopy = () => useContext(DesignContext).design.copy;

/** css entrance keyframes all start with this, see app/design.css */
const ENTRANCE_ANIMATION_PREFIX = "design-enter";

function applyMode(mode: DesignPreviewMessage["mode"]) {
	const root = document.documentElement;
	if (root.classList.contains("dark") !== (mode === "dark")) {
		root.classList.toggle("dark", mode === "dark");
	}
	root.style.colorScheme = mode;
}

function applyPreview(
	design: DesignConfig,
	mode: DesignPreviewMessage["mode"]
) {
	const root = document.documentElement;
	for (const [name, value] of Object.entries(designAttributes(design))) {
		root.setAttribute(name, value);
	}
	const style = document.getElementById("site-design");
	if (style) {
		style.textContent = designCss(design);
	}
	applyMode(mode);
}

function replayEntrances() {
	window.scrollTo({ behavior: "instant", top: 0 });
	for (const animation of document.getAnimations()) {
		if (
			animation instanceof CSSAnimation &&
			animation.animationName.startsWith(ENTRANCE_ANIMATION_PREFIX)
		) {
			animation.cancel();
			animation.play();
		}
	}
}

/**
 * Hands the published design to the page, and lets the vault's design studio
 * restyle and reword a framed copy of the site live. The preview half only
 * wakes up inside an iframe opened with ?design-preview, and only takes
 * messages from this origin, so it is inert for every normal visit.
 */
export function DesignProvider({
	children,
	design,
}: {
	children: React.ReactNode;
	design: DesignConfig;
}) {
	const [preview, setPreview] = useState<DesignConfig | null>(null);
	const [replay, setReplay] = useState(0);

	useEffect(() => {
		const framed = window.self !== window.top;
		const requested = new URLSearchParams(window.location.search).has(
			PREVIEW_PARAM
		);
		if (!(framed && requested)) {
			return;
		}

		let forcedMode: DesignPreviewMessage["mode"] | null = null;

		const onMessage = (
			event: MessageEvent<DesignPreviewMessage | DesignReplayMessage>
		) => {
			if (event.origin !== window.location.origin) {
				return;
			}
			if (event.data?.type === "design-replay") {
				replayEntrances();
				setReplay((count) => count + 1);
				return;
			}
			if (event.data?.type !== "design-preview") {
				return;
			}
			const next = normalizeDesign(event.data.config);
			forcedMode = event.data.mode;
			applyPreview(next, event.data.mode);
			setPreview(next);
		};

		// next-themes re-applies the visitor's theme after mount; the frame's
		// mode has to win, so put it back whenever the class changes
		const observer = new MutationObserver(() => {
			if (forcedMode) {
				applyMode(forcedMode);
			}
		});
		observer.observe(document.documentElement, {
			attributeFilter: ["class"],
			attributes: true,
		});

		window.addEventListener("message", onMessage);
		window.parent.postMessage(
			{ type: "design-preview-ready" },
			window.location.origin
		);
		return () => {
			observer.disconnect();
			window.removeEventListener("message", onMessage);
		};
	}, []);

	const value = effectiveDesign(preview ?? design);

	return (
		<DesignContext.Provider value={{ design: value, replay }}>
			{children}
		</DesignContext.Provider>
	);
}
