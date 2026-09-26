"use client";

import { useEffect } from "react";
import { designAttributes, designCss } from "@/lib/design/css";
import { normalizeDesign } from "@/lib/design/options";

export const PREVIEW_PARAM = "design-preview";

export interface DesignPreviewMessage {
	config: unknown;
	mode: "dark" | "light";
	type: "design-preview";
}

function applyMode(mode: DesignPreviewMessage["mode"]) {
	const root = document.documentElement;
	if (root.classList.contains("dark") !== (mode === "dark")) {
		root.classList.toggle("dark", mode === "dark");
	}
	root.style.colorScheme = mode;
}

function applyPreview({ config, mode }: DesignPreviewMessage) {
	const design = normalizeDesign(config);
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
 * Lets the vault's design studio restyle a framed copy of the site live.
 * Only wakes up inside an iframe opened with ?design-preview, and only takes
 * messages from this origin, so it is inert for every normal visit.
 */
export function DesignPreviewBridge() {
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
			forcedMode = event.data.mode;
			applyPreview(event.data);
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

	return null;
}
