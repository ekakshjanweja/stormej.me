"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Loader2, Monitor, Smartphone } from "lucide-react";
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
 * The iframe mounts once the block scrolls near the viewport, so a reader who
 * never reaches it never pays for the bundle, and one who does gets it running
 * without having to ask.
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
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [layout, setLayout] = useState<Layout>("mobile");
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    // Older browsers just get the demo immediately rather than never.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        track("trove_demo_started", { demo: name });
        observer.disconnect();
      },
      // Start fetching just before it scrolls in so it is usually ready on
      // arrival.
      { rootMargin: "300px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [name]);

  return (
    <div
      ref={containerRef}
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

      <div className="relative flex justify-center bg-muted/20 p-4">
        {inView && (
          <iframe
            // Remount on theme change so the demo re-reads ?theme. Layout
            // changes only resize it, so flutter reflows without a reload.
            key={theme}
            src={`${src}?theme=${theme}`}
            title={`${name} interactive demo`}
            onLoad={() => setLoaded(true)}
            style={{
              height,
              maxWidth: layout === "mobile" ? width : undefined,
            }}
            className={cn(
              "block w-full rounded-md border border-border/40 bg-background transition-opacity duration-150 ease-out motion-reduce:transition-none",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {!loaded && (
          <div
            style={{ height: inView ? undefined : height }}
            className={cn(
              "flex flex-col items-center justify-center gap-2 text-center",
              inView && "absolute inset-0"
            )}
            role="status"
          >
            <Loader2
              className="size-4 animate-spin text-muted-foreground"
              aria-hidden
            />
            <p className="text-[12px] font-light text-muted-foreground">
              starting the demo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
