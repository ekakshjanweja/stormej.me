"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useId, useRef, useState } from "react";

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
				fontFamily: "inherit",
				securityLevel: "loose",
				startOnLoad: false,
				theme: resolvedTheme === "dark" ? "dark" : "default",
				themeCSS: "margin: 1.5rem auto 0;",
			});
			const result = await mermaid.render(id, chart.replaceAll("\\n", "\n"));
			if (cancelled) {
				return;
			}
			bindRef.current = result.bindFunctions ?? null;
			setSvg(result.svg);
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
			className="mermaid-diagram my-6 flex justify-center overflow-x-auto text-foreground [&_svg]:h-auto [&_svg]:max-w-full"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid renders the svg itself; there is no react tree to mount
			dangerouslySetInnerHTML={{ __html: svg }}
			ref={bindContainer}
		/>
	);
}
