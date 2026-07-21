"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Play, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

type Layout = "mobile" | "desktop";

const LAYOUTS: { value: Layout; label: string; Icon: typeof Smartphone }[] = [
  { value: "mobile", label: "mobile layout", Icon: Smartphone },
  { value: "desktop", label: "desktop layout", Icon: Monitor },
];

/**
 * Embeds a Flutter web build of a trove entry.
 *
 * The iframe only mounts after a click so the page costs nothing until a
 * reader opts in — a Flutter bundle is a few MB plus the canvaskit fetch.
 */
export function FlutterDemo({
  src,
  name,
  height = 520,
  width = 380,
  className,
}: {
  src: string;
  name: string;
  height?: number;
  width?: number;
  className?: string;
}) {
  const [running, setRunning] = useState(false);
  const [layout, setLayout] = useState<Layout>("mobile");
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  const run = () => {
    setRunning(true);
    track("trove_demo_started", { demo: name });
  };

  return (
    <div
      className={cn(
        "my-4 overflow-hidden rounded-md border border-border/40",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/40 px-3 py-1.5">
        <span className="meta-tag">live demo</span>
        <span className="hidden shrink-0 text-[12px] font-light text-muted-foreground sm:inline">
          flutter web
        </span>

        <div className="ml-auto inline-flex shrink-0 overflow-hidden rounded-md border border-border/60">
          {LAYOUTS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLayout(value)}
              aria-pressed={layout === value}
              aria-label={label}
              title={label}
              className={cn(
                "inline-flex items-center justify-center px-2 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset",
                layout === value
                  ? "bg-muted/60 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      {running ? (
        <div className="flex justify-center bg-muted/20 p-4">
          <iframe
            // Remount on theme change so the demo re-reads ?theme. Layout
            // changes only resize it, so flutter reflows without a reload.
            key={theme}
            src={`${src}?theme=${theme}`}
            title={`${name} interactive demo`}
            loading="lazy"
            style={{ height, maxWidth: layout === "mobile" ? width : undefined }}
            className="block w-full rounded-md border border-border/40 bg-background"
          />
        </div>
      ) : (
        <div
          style={{ height: height + 32 }}
          className="flex flex-col items-center justify-center gap-3 bg-muted/20 px-6 text-center"
        >
          <button
            type="button"
            onClick={run}
            className="inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
          >
            <Play className="size-3.5" aria-hidden />
            run the demo
          </button>
          <p className="max-w-[42ch] text-pretty text-[12px] font-light leading-[1.6] text-muted-foreground">
            the real widget, compiled to flutter web. a few mb, so it loads only
            when you ask.
          </p>
        </div>
      )}
    </div>
  );
}
