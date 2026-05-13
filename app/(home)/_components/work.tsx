"use client";

import {
  formatTotalExperienceAriaLabel,
  formatTotalExperienceShort,
  listWork,
  listWorkForHome,
} from "@/lib/work";
import Link from "next/link";
import Image from "next/image";
import { LogoTile } from "@/components/logo-tile";
import { Iphone17Pro } from "@/components/ui/iphone-17-pro";
import { cn } from "@/lib/utils";
import type {
  ScreenshotMockupKind,
  WorkImageAsset,
  WorkLogoAsset,
} from "@/lib/types/types";
import { isPairedScreenshots, isVideoAsset } from "@/lib/work-image";
import { useState } from "react";

const PLACEHOLDER_GRADIENTS = [
  "from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800",
  "from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800",
  "from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800",
];

function formatRange(start: Date, end?: Date | null) {
  const fmt = (d: Date) =>
    d
      .toLocaleString("default", { month: "short", year: "numeric" })
      .toLowerCase();
  return `${fmt(start)} to ${end ? fmt(end) : "present"}`;
}

export default function Work() {
  const work = listWork();
  const totalExp = formatTotalExperienceShort(work);
  const totalExpAria = formatTotalExperienceAriaLabel(work);
  const homeWork = listWorkForHome();
  return (
    <section data-cursor-anchor="work">
      <div className="flex justify-between items-baseline mb-6 gap-4">
        <h2 className="section-label inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5">
          <span>work</span>
          {totalExp ? (
            <span
              className="meta-tag normal-case tracking-[0.06em]"
              aria-label={totalExpAria}
            >
              ({totalExp})
            </span>
          ) : null}
        </h2>
        <Link
          href="/work"
          className="meta-tag hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
        >
          view all
        </Link>
      </div>
      <ul className="flex flex-col">
        {homeWork.map((item) => (
          <HomeWorkItem key={item.slug} item={item} />
        ))}
      </ul>
    </section>
  );
}

function HomeWorkItem({
  item,
}: {
  item: ReturnType<typeof listWorkForHome>[number];
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const showPreview = isHovered || isFocused;

  return (
    <li
      className="group/work relative py-4 first:pt-0 last:pb-0 hover:z-50 focus-within:z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/work/${item.slug}`}
        className="group flex items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {item.logo ? (
          <LogoTile src={item.logo} boxClassName="h-9 w-9" />
        ) : (
          <span
            aria-hidden
            className="font-serif italic text-[34px] leading-none text-foreground/85 w-9 shrink-0 text-center select-none"
            style={{
              fontFamily: "var(--font-instrument-serif), serif",
            }}
          >
            {item.title.charAt(0).toLowerCase()}
          </span>
        )}
        <div className="flex items-center justify-between gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="squiggle-link-hover text-[14px] font-medium text-foreground truncate">
              {item.title}
            </span>
            <span className="text-[12px] font-light text-muted-foreground leading-tight">
              {item.role}
            </span>
            <span className="meta-tag whitespace-nowrap sm:hidden mt-0.5">
              {formatRange(item.startDate, item.endDate)}
            </span>
          </div>
          <span className="meta-tag whitespace-nowrap shrink-0 hidden sm:inline">
            {formatRange(item.startDate, item.endDate)}
          </span>
        </div>
      </Link>
      <HomeWorkPreview
        title={item.title}
        href={`/work/${item.slug}`}
        logo={item.logo}
        images={item.images}
        screenshotMockup={item.screenshotMockup}
        visible={showPreview}
      />
    </li>
  );
}

function HomeWorkPreview({
  title,
  href,
  logo,
  images,
  screenshotMockup,
  visible,
}: {
  title: string;
  href: string;
  logo?: WorkLogoAsset;
  images?: WorkImageAsset[];
  screenshotMockup?: ScreenshotMockupKind;
  visible: boolean;
}) {
  const slots =
    images && images.length > 0 ? images.slice(0, 3) : [null, null, null];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute bottom-full left-0 z-50 mb-3 min-w-0 origin-bottom-left rounded-md border border-border bg-popover shadow-sm transition-all duration-150 ease-out hidden md:block",
        visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-1 scale-[0.98] opacity-0"
      )}
    >
      <Link
        href={href}
        tabIndex={-1}
        className="box-border flex w-[min(292px,calc(100vw-2rem))] min-w-0 shrink-0 flex-col overflow-hidden transition-colors duration-150 hover:border-foreground/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
      >
        <div className="flex w-full items-end justify-center gap-2 px-3 pt-3 pb-2">
          {slots.map((src, i) => (
            <HomePreviewPhone
              key={i}
              src={src}
              logo={logo}
              title={title}
              screenshotMockup={screenshotMockup}
              gradient={PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length]}
            />
          ))}
        </div>
        <div className="min-w-0 overflow-hidden border-t border-border/70 px-3 py-1.5">
          <span
            className="meta-tag block min-w-0 truncate normal-case tracking-[0.08em]"
            title={title}
          >
            {title}
          </span>
        </div>
      </Link>
    </div>
  );
}

function HomePreviewPhone({
  src,
  logo,
  title,
  screenshotMockup,
  gradient,
}: {
  src: WorkImageAsset | null;
  logo?: WorkLogoAsset;
  title: string;
  screenshotMockup?: ScreenshotMockupKind;
  gradient: string;
}) {
  const useIphone17 =
    Boolean(src) &&
    screenshotMockup === "iphone-17-pro" &&
    !(typeof src === "string" && isVideoAsset(src));

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        useIphone17
          ? "h-[158px] w-[84px] overflow-visible px-px"
          : "h-[160px] w-[80px] overflow-hidden rounded-[10px] border border-border/80 bg-background shadow-sm"
      )}
    >
      {src ? (
        typeof src === "string" && isVideoAsset(src) ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : useIphone17 ? (
          isPairedScreenshots(src) ? (
            <>
              <Iphone17Pro
                src={src.light}
                width={74}
                height={148}
                className="dark:hidden"
              />
              <Iphone17Pro
                src={src.dark}
                width={74}
                height={148}
                className="hidden dark:block"
              />
            </>
          ) : typeof src === "string" ? (
            <Iphone17Pro src={src} width={74} height={148} />
          ) : null
        ) : isPairedScreenshots(src) ? (
          <>
            <Image
              src={src.light}
              alt={`${title} screenshot (light)`}
              fill
              sizes="80px"
              className="object-cover dark:hidden"
            />
            <Image
              src={src.dark}
              alt={`${title} screenshot (dark)`}
              fill
              sizes="80px"
              className="hidden object-cover dark:block"
            />
          </>
        ) : (
          <Image
            src={src}
            alt={`${title} screenshot`}
            fill
            sizes="80px"
            className="object-cover"
          />
        )
      ) : (
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)}>
          <div className="absolute left-1/2 top-2 h-1 w-6 -translate-x-1/2 rounded-full bg-foreground/20" />
          {logo && (
            <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 opacity-50">
              {isPairedScreenshots(logo) ? (
                <>
                  <Image
                    src={logo.light}
                    alt=""
                    fill
                    sizes="24px"
                    className="object-contain dark:hidden"
                  />
                  <Image
                    src={logo.dark}
                    alt=""
                    fill
                    sizes="24px"
                    className="hidden object-contain dark:block"
                  />
                </>
              ) : (
                <Image
                  src={logo}
                  alt=""
                  fill
                  sizes="24px"
                  className="object-contain"
                />
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
