"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { designAttributes, designCss } from "@/lib/design/css";
import {
	DEFAULT_COPY,
	type DesignConfig,
	type HeroCopy,
	normalizeDesign,
} from "@/lib/design/options";

export const PREVIEW_PARAM = "design-preview";

export interface DesignPreviewMessage {
	config: unknown;
	mode: "dark" | "light";
	type: "design-preview";
}

const HeroCopyContext = createContext<HeroCopy>(DEFAULT_COPY);

/** the published hero copy, or the studio's draft inside a preview frame */
export const useHeroCopy = () => useContext(HeroCopyContext);

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

/**
 * Hands the published copy to the page, and lets the vault's design studio
 * restyle and reword a framed copy of the site live. The preview half only
 * wakes up inside an iframe opened with ?design-preview, and only takes
 * messages from this origin, so it is inert for every normal visit.
 */
export function DesignProvider({
	children,
	copy,
}: {
	children: React.ReactNode;
	copy: HeroCopy;
}) {
	const [previewCopy, setPreviewCopy] = useState<HeroCopy | null>(null);

	useEffect(() => {
		const framed = window.self !== window.top;
		const requested = new URLSearchParams(window.location.search).has(
			PREVIEW_PARAM
		);
		if (!(framed && requested)) {
			return;
		}

		let forcedMode: DesignPreviewMessage["mode"] | null = null;

		const onMessage = (event: MessageEvent<DesignPreviewMessage>) => {
			if (
				event.origin !== window.location.origin ||
				event.data?.type !== "design-preview"
			) {
				return;
			}
			const design = normalizeDesign(event.data.config);
			forcedMode = event.data.mode;
			applyPreview(design, event.data.mode);
			setPreviewCopy(design.copy);
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

	return (
		<HeroCopyContext.Provider value={previewCopy ?? copy}>
			{children}
		</HeroCopyContext.Provider>
	);
}
