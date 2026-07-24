"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "next-themes";

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
        startOnLoad: false,
        securityLevel: "loose",
        fontFamily: "inherit",
        themeCSS: "margin: 1.5rem auto 0;",
        theme: resolvedTheme === "dark" ? "dark" : "default",
      });
      const result = await mermaid.render(id, chart.replaceAll("\\n", "\n"));
      if (cancelled) return;
      bindRef.current = result.bindFunctions ?? null;
      setSvg(result.svg);
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme, id]);

  if (!svg) return null;

  return (
    <div
      ref={(container) => {
        if (container) bindRef.current?.(container);
      }}
      className="mermaid-diagram my-6 flex justify-center overflow-x-auto text-foreground [&_svg]:h-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
