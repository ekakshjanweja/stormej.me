"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useId, useRef, useState } from "react";

/** soft corners and hairline strokes, like the rest of the site */
const DIAGRAM_CSS = `
	margin: 1.5rem auto 0;
	.node rect, .node polygon, .node circle { stroke-width: 1px; }
	.node rect { rx: 8px; ry: 8px; }
	.edgeLabel, .edgeLabel p { font-size: 12px; }
`;

/** mermaid pins each svg's natural width as an inline max-width */
const NATURAL_WIDTH = /max-width:\s*([\d.]+)px/;
/**
 * the smallest a diagram may shrink to. below this its labels stop being
 * readable, so on a phone it scrolls sideways instead
 */
const MIN_SCALE = 0.85;

/** the diagram's colours come from the site's own tokens, light or dark */
function siteThemeVariables() {
	const tokens = getComputedStyle(document.documentElement);
	const token = (name: string) => tokens.getPropertyValue(name).trim();
	const background = token("--background");
	const card = token("--card");
	const foreground = token("--foreground");
	const muted = token("--muted-foreground");
	return {
		background,
		clusterBkg: background,
		clusterBorder: token("--border"),
		edgeLabelBackground: background,
		fontSize: "14px",
		lineColor: muted,
		mainBkg: card,
		nodeBorder: muted,
		primaryBorderColor: muted,
		primaryColor: card,
		primaryTextColor: foreground,
		secondaryColor: card,
		tertiaryColor: background,
		textColor: foreground,
	};
}

export function Mermaid({ chart }: { chart: string }) {
	const id = useId().replace(/:/g, "");
	const { resolvedTheme } = useTheme();
	const [svg, setSvg] = useState<string>("");
	const bindRef = useRef<((el: Element) => void) | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const { default: mermaid } = await import("mermaid");
			mermaid.initialize({
				darkMode: resolvedTheme === "dark",
				flowchart: { curve: "basis", padding: 14 },
				// measure labels with the page's real font, or they get clipped
				fontFamily: getComputedStyle(document.body).fontFamily,
				securityLevel: "loose",
				startOnLoad: false,
				theme: "base",
				themeCSS: DIAGRAM_CSS,
				themeVariables: siteThemeVariables(),
			});
			const result = await mermaid.render(id, chart.replaceAll("\\n", "\n"));
			if (cancelled) {
				return;
			}
			bindRef.current = result.bindFunctions ?? null;
			setSvg(
				result.svg.replace(
					NATURAL_WIDTH,
					(rule, width) =>
						`${rule}; min-width: ${Math.round(Number(width) * MIN_SCALE)}px`
				)
			);
		})();
		return () => {
			cancelled = true;
		};
	}, [chart, resolvedTheme, id]);

	const bindContainer = useCallback((container: HTMLDivElement | null) => {
		if (container) {
			bindRef.current?.(container);
		}
	}, []);

	if (!svg) {
		return null;
	}

	return (
		<div
			className="mermaid-diagram my-6 overflow-x-auto text-foreground [&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-full"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid renders the svg itself; there is no react tree to mount
			dangerouslySetInnerHTML={{ __html: svg }}
			ref={bindContainer}
		/>
	);
}
