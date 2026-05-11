"use client";

import { useEffect, useRef } from "react";
import { AppStore } from "@/components/ui/app-store";
import { PlayStore } from "@/components/ui/play-store";
import { cn } from "@/lib/utils";

type StoreLink = {
  href: string;
  label?: string;
};

const storeIconLink =
  "group relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-visible bg-background transition duration-150 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded-md";

const hoverLabel =
  "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/70 bg-popover px-2 py-1 text-[10px] font-medium leading-none tracking-wide text-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:opacity-100 motion-reduce:group-focus-visible:opacity-100 group-data-[placement=bottom]:top-[calc(100%+8px)] group-data-[placement=bottom]:bottom-auto";

export function StoreLinks({
  appStore,
  playStore,
  className,
}: {
  appStore?: StoreLink | StoreLink[];
  playStore?: StoreLink | StoreLink[];
  className?: string;
}) {
  const appStoreItems = appStore
    ? Array.isArray(appStore)
      ? appStore
      : [appStore]
    : [];
  const playStoreItems = playStore
    ? Array.isArray(playStore)
      ? playStore
      : [playStore]
    : [];

  if (appStoreItems.length === 0 && playStoreItems.length === 0) return null;

  const iconRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    const tooltipOffset = 8;
    const tooltipHeight = 22;
    let raf = 0;

    const updatePlacement = () => {
      const nav = document.querySelector("nav");
      const navHeight = nav ? nav.getBoundingClientRect().height : 0;
      const safeTop = navHeight + tooltipOffset;
      const needed = tooltipHeight + tooltipOffset;

      iconRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const spaceAbove = rect.top - safeTop;
        const spaceBelow = window.innerHeight - rect.bottom;
        let placement: "top" | "bottom" = "top";

        if (spaceAbove < needed && spaceBelow >= needed) {
          placement = "bottom";
        } else if (spaceBelow < needed && spaceAbove >= needed) {
          placement = "top";
        } else if (spaceAbove < needed && spaceBelow < needed) {
          placement = spaceBelow > spaceAbove ? "bottom" : "top";
        }

        el.dataset.placement = placement;
      });
    };

    const scheduleUpdate = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updatePlacement);
    };

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
    };
  }, [appStoreItems.length, playStoreItems.length]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 overflow-visible",
        className
      )}
    >
      {appStoreItems.map((item, i) => (
        <a
          key={`app-${i}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label ?? "App Store"}
          className={storeIconLink}
          ref={(node) => {
            iconRefs.current[i] = node;
          }}
          data-placement="top"
        >
          <span className={hoverLabel} aria-hidden>
            {item.label ?? "App Store"}
          </span>
          <AppStore className="relative z-0 h-5 w-5" aria-hidden />
        </a>
      ))}
      {playStoreItems.map((item, i) => (
        <a
          key={`play-${i}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label ?? "Google Play"}
          className={storeIconLink}
          ref={(node) => {
            iconRefs.current[appStoreItems.length + i] = node;
          }}
          data-placement="top"
        >
          <span className={hoverLabel} aria-hidden>
            {item.label ?? "Google Play"}
          </span>
          <PlayStore className="relative z-0 h-5 w-5" aria-hidden />
        </a>
      ))}
    </div>
  );
}
