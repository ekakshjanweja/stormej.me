"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Loader2, Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

type Layout = "mobile" | "desktop";

/** Logical viewport sizes the flutter embed should reflow at. */
const DEVICE_FRAMES = {
  mobile: { width: 390, height: 844, label: "iphone layout", Icon: Smartphone },
  desktop: { width: 1280, height: 800, label: "mac layout", Icon: Monitor },
} as const satisfies Record<
  Layout,
  { width: number; height: number; label: string; Icon: typeof Smartphone }
>;

function layoutForViewport(): Layout {
  return window.matchMedia("(min-width: 768px)").matches ? "desktop" : "mobile";
}

function subscribeToViewportLayout(onStoreChange: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

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
  className,
}: {
  src: string;
  name: string;
  className?: string;
}) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [manualLayout, setManualLayout] = useState<Layout | null>(null);
  const viewportLayout = useSyncExternalStore(
    subscribeToViewportLayout,
    layoutForViewport,
    () => "mobile",
  );
  const layout = manualLayout ?? viewportLayout;
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const frame = DEVICE_FRAMES[layout];

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
      { rootMargin: "300px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [name]);

  return (
    <div
      ref={containerRef}
      className={cn("my-4 flex w-full justify-center not-prose", className)}
    >
      <div
        className="w-full overflow-hidden rounded-md border border-border/40"
        style={{ maxWidth: frame.width }}
      >
        <div className="flex h-9 items-center gap-3 border-b border-border/40 px-3">
          <span className="meta-tag">live demo</span>
          <span className="hidden shrink-0 text-[12px] font-light text-muted-foreground sm:inline">
            {layout === "mobile" ? "iphone" : "mac"}
          </span>

          <div className="ml-auto inline-flex shrink-0 overflow-hidden rounded-md border border-border/60">
            {(Object.keys(DEVICE_FRAMES) as Layout[]).map((value) => {
              const { label, Icon } = DEVICE_FRAMES[value];
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setManualLayout(value)}
                  aria-pressed={layout === value}
                  aria-label={label}
                  title={label}
                  className={cn(
                    "inline-flex items-center justify-center px-2 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset",
                    layout === value
                      ? "bg-muted/60 text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="relative w-full bg-background"
          style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
        >
          {inView && (
            <iframe
              // Remount on theme change so the demo re-reads ?theme. Layout
              // changes only resize it, so flutter reflows without a reload.
              key={theme}
              src={`${src}?theme=${theme}`}
              title={`${name} interactive demo`}
              onLoad={() => setLoaded(true)}
              className={cn(
                "absolute inset-0 block h-full w-full border-0 bg-background transition-opacity duration-150 ease-out motion-reduce:transition-none",
                loaded ? "opacity-100" : "opacity-0",
              )}
            />
          )}

          {!loaded && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center"
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
    </div>
  );
}
