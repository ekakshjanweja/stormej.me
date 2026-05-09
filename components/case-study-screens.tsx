"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import * as React from "react";
import { Iphone17Pro } from "@/components/ui/iphone-17-pro";
import { cn } from "@/lib/utils";
import type { ScreenshotMockupKind, WorkImageAsset } from "@/lib/types/types";
import {
  isPairedScreenshots,
  isVideoAsset,
  workImageStableKey,
} from "@/lib/work-image";

function ThemedScreenshot({
  asset,
  alt,
  priority,
  sizes,
  className,
  fit,
}: {
  asset: WorkImageAsset;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
  fit: "cover" | "contain";
}) {
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";
  if (isPairedScreenshots(asset)) {
    return (
      <>
        <Image
          src={asset.light}
          alt={`${alt} (light)`}
          fill
          priority={priority}
          sizes={sizes}
          className={cn(fitClass, "dark:hidden", className)}
        />
        <Image
          src={asset.dark}
          alt={`${alt} (dark)`}
          fill
          priority={priority}
          sizes={sizes}
          className={cn(fitClass, "hidden dark:block", className)}
        />
      </>
    );
  }
  return (
    <Image
      src={asset}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn(fitClass, className)}
    />
  );
}

function IphoneMockupScreens({
  asset,
  className,
}: {
  asset: WorkImageAsset;
  className?: string;
}) {
  const commonCn = cn("mx-auto w-full max-w-[min(100%,228px)]", className);

  if (isPairedScreenshots(asset)) {
    return (
      <div className={commonCn}>
        <Iphone17Pro
          src={asset.light}
          className="dark:hidden"
          aria-hidden
        />
        <Iphone17Pro
          src={asset.dark}
          className="hidden dark:block"
          aria-hidden
        />
      </div>
    );
  }
  return <Iphone17Pro src={asset} className={commonCn} aria-hidden />;
}

function galleryLayoutClass(count: number) {
  if (count <= 1) {
    return "mx-auto grid max-w-[260px] grid-cols-1 justify-items-stretch";
  }
  if (count === 2) {
    return cn(
      "mx-auto grid max-w-xl grid-cols-1 justify-items-stretch gap-6",
      "sm:grid-cols-2 sm:gap-5",
      "md:gap-6",
    );
  }
  return cn(
    "mx-auto grid max-w-5xl grid-cols-1 justify-items-stretch gap-7",
    "sm:grid-cols-3 sm:items-end sm:gap-5",
    "md:gap-7",
  );
}

export function CaseStudyScreens({
  images,
  title,
  screenshotMockup,
  sectionId = "screenshots",
  appendix,
}: {
  images: WorkImageAsset[];
  title: string;
  screenshotMockup?: ScreenshotMockupKind;
  /** Anchor id for in-page links (sticky nav, etc.). */
  sectionId?: string;
  /** After main copy: top rule, spacing, tighter vertical rhythm for an “appendix” gallery. */
  appendix?: boolean;
}) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const count = images.length;

  React.useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowLeft")
        setOpenIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      if (e.key === "ArrowRight")
        setOpenIndex((i) =>
          i !== null && i < images.length - 1 ? i + 1 : i,
        );
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, images.length]);

  return (
    <>
      <section
        id={sectionId}
        aria-label="Screenshots"
        className={cn(
          "scroll-mt-32",
          appendix
            ? "mt-14 space-y-5 border-t border-border/55 pt-12 pb-2"
            : "mb-12 space-y-4",
        )}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="meta-tag">{appendix ? "gallery" : "screenshots"}</span>
          {appendix && (
            <span className="text-[12px] font-light tracking-wide text-muted-foreground">
              open any screen to enlarge · {images.length} shots
            </span>
          )}
        </div>
        <div
          className={cn(
            "rounded-2xl border border-border/60 bg-muted/[0.12] backdrop-blur-[2px]",
            appendix ? "p-5 md:p-6" : "p-5 shadow-sm md:p-7",
          )}
        >
          <ul className={galleryLayoutClass(count)}>
            {images.map((asset, i) => (
              <li key={workImageStableKey(asset, i)} className="min-w-0">
                <ScreenCard
                  asset={asset}
                  title={title}
                  index={i}
                  priority={i === 0}
                  screenshotMockup={screenshotMockup}
                  onOpen={() => setOpenIndex(i)}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {openIndex !== null && (
        <Lightbox
          asset={images[openIndex]!}
          title={title}
          index={openIndex}
          total={images.length}
          screenshotMockup={screenshotMockup}
          onClose={() => setOpenIndex(null)}
          onPrev={() => openIndex > 0 && setOpenIndex(openIndex - 1)}
          onNext={() =>
            openIndex < images.length - 1 && setOpenIndex(openIndex + 1)
          }
        />
      )}
    </>
  );
}

function ScreenCard({
  asset,
  title,
  index,
  priority,
  screenshotMockup,
  onOpen,
}: {
  asset: WorkImageAsset;
  title: string;
  index: number;
  priority?: boolean;
  screenshotMockup?: ScreenshotMockupKind;
  onOpen: () => void;
}) {
  const video = isVideoAsset(asset) && typeof asset === "string";
  const useIphone17 =
    !video && screenshotMockup === "iphone-17-pro";
  const label = `${title}, screen ${index + 1}`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex h-full w-full flex-col text-left outline-none transition-[box-shadow,transform,border-color,opacity] duration-200",
        useIphone17
          ? "rounded-2xl border border-transparent bg-transparent p-2 shadow-none hover:border-border/40 hover:bg-muted/10"
          : "rounded-xl border border-border/50 bg-background/80 p-2.5 shadow-sm hover:z-[1] hover:border-foreground/20 hover:shadow-md",
        "focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      aria-label={`Open ${label} larger`}
    >
      {video ? (
        <div
          className="relative aspect-[9/19] w-full overflow-hidden rounded-lg border border-border/40 bg-muted/30 shadow-inner"
          aria-hidden
        >
          <div className="absolute left-1/2 top-2 z-[1] h-1 w-8 -translate-x-1/2 rounded-full bg-foreground/[0.1]" />
          <video
            src={asset}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
        </div>
      ) : useIphone17 ? (
        <IphoneMockupScreens asset={asset} />
      ) : (
        <div
          className="relative aspect-[9/19] w-full overflow-hidden rounded-lg border border-border/40 bg-muted/30 shadow-inner"
          aria-hidden
        >
          <div className="absolute left-1/2 top-2 z-[1] h-1 w-8 -translate-x-1/2 rounded-full bg-foreground/[0.1]" />
          <ThemedScreenshot
            asset={asset}
            alt={label}
            priority={priority}
            sizes="(min-width: 640px) 22vw, 78vw"
            fit="cover"
          />
        </div>
      )}
      <span className="mt-2.5 flex items-center justify-between gap-2 px-0.5 text-[10px] font-normal uppercase tracking-[0.16em] text-muted-foreground">
        <span className="tabular-nums">
          {video ? "clip" : "screen"} · {index + 1}
        </span>
      </span>
    </button>
  );
}

function Lightbox({
  asset,
  title,
  index,
  total,
  screenshotMockup,
  onClose,
  onPrev,
  onNext,
}: {
  asset: WorkImageAsset;
  title: string;
  index: number;
  total: number;
  screenshotMockup?: ScreenshotMockupKind;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const video = isVideoAsset(asset) && typeof asset === "string";
  const useIphone17 =
    !video && screenshotMockup === "iphone-17-pro";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${title}, ${index + 1} of ${total}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close gallery"
        className="absolute inset-0 bg-background/88 backdrop-blur-md"
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-[2] inline-flex rounded-full border border-border/80 bg-background/90 p-2 text-foreground shadow-sm transition-colors hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={onPrev}
            disabled={index === 0}
            className="absolute left-2 top-1/2 z-[2] -translate-y-1/2 rounded-full border border-border/80 bg-background/90 p-2.5 shadow-sm transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-25 sm:left-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={index === total - 1}
            className="absolute right-2 top-1/2 z-[2] -translate-y-1/2 rounded-full border border-border/80 bg-background/90 p-2.5 shadow-sm transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-25 sm:right-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <div
        className={cn(
          "relative z-[1] flex max-h-[min(88vh,860px)] w-full flex-col items-center",
          useIphone17 ? "max-w-[min(100%,340px)]" : "max-w-[min(100%,420px)]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {video ? (
          <div className="relative aspect-[9/19] w-full overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl ring-1 ring-black/10 dark:ring-white/10">
            <video
              src={asset}
              controls
              playsInline
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        ) : useIphone17 ? (
          <IphoneMockupScreens
            asset={asset}
            className="max-w-[min(100%,300px)] sm:max-w-[min(100%,320px)]"
          />
        ) : (
          <div className="relative aspect-[9/19] w-full overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl ring-1 ring-black/10 dark:ring-white/10">
            <ThemedScreenshot
              asset={asset}
              alt={`${title}, full size ${index + 1}`}
              priority
              sizes="(min-width: 640px) 420px, 100vw"
              fit="contain"
            />
          </div>
        )}
        {total > 1 && (
          <p className="mt-4 meta-tag tabular-nums">
            {index + 1} / {total}
          </p>
        )}
      </div>
    </div>
  );
}
