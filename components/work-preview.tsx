"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Iphone17Pro } from "@/components/ui/iphone-17-pro";
import { cn } from "@/lib/utils";
import type {
  ScreenshotMockupKind,
  WorkImageAsset,
  WorkLogoAsset,
} from "@/lib/types/types";
import { isPairedScreenshots, isVideoAsset } from "@/lib/work-image";

type WorkPreviewProps = {
  children: React.ReactNode;
  title: string;
  href: string;
  logo?: WorkLogoAsset;
  images?: WorkImageAsset[];
  screenshotMockup?: ScreenshotMockupKind;
  className?: string;
};

const PLACEHOLDER_GRADIENTS = [
  "from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800",
  "from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800",
  "from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800",
];

/** Exact width: 3×PhoneFrame + 2×gap-2 + 2×px-3 on the strip (gap-2 = 0.5rem, px-3 = 0.75rem @ 16px root). */
const PREVIEW_CARD_WIDTH_PX = {
  "iphone-17-pro": 292, // 252 + 16 + 24
  default: 280, // 240 + 16 + 24
} as const;

function previewCardWidthPx(mockup?: ScreenshotMockupKind) {
  return mockup === "iphone-17-pro"
    ? PREVIEW_CARD_WIDTH_PX["iphone-17-pro"]
    : PREVIEW_CARD_WIDTH_PX.default;
}

/** Capped at phone-strip width so long titles cannot widen the hover card (flex min-width:auto). */
function previewCardShellStyle(px: number): React.CSSProperties {
  return {
    width: `min(${px}px, calc(100vw - 1.5rem))`,
    maxWidth: `min(${px}px, calc(100vw - 1.5rem))`,
    minWidth: 0,
  };
}

export function WorkPreview({
  children,
  title,
  href,
  logo,
  images,
  screenshotMockup,
  className,
}: WorkPreviewProps) {
  const [isOpen, setOpen] = React.useState(false);
  const slots =
    images && images.length > 0 ? images.slice(0, 3) : [null, null, null];
  const cardPx = previewCardWidthPx(screenshotMockup);
  const cardShellStyle = previewCardShellStyle(cardPx);

  return (
    <HoverCardPrimitive.Root
      openDelay={150}
      closeDelay={120}
      onOpenChange={setOpen}
    >
      <HoverCardPrimitive.Trigger asChild className={className}>
        {children}
      </HoverCardPrimitive.Trigger>

      <HoverCardPrimitive.Content
        className="z-50 w-max min-w-0 origin-[--radix-hover-card-content-transform-origin] p-0 outline-none"
        side="top"
        align="start"
        sideOffset={12}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="min-w-0 overflow-hidden"
              style={cardShellStyle}
              initial={{ opacity: 0, y: 4, scale: 0.97 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
              }}
              exit={{
                opacity: 0,
                y: 4,
                scale: 0.97,
                transition: { duration: 0.1, ease: [0.4, 0, 1, 1] },
              }}
            >
              <Link
                href={href}
                style={cardShellStyle}
                className={cn(
                  "box-border flex min-w-0 shrink-0 flex-col overflow-hidden rounded-md border border-border bg-popover transition-colors duration-150 hover:border-foreground/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                )}
              >
                <div className="flex w-full items-end justify-center gap-2 px-3 pt-3 pb-2">
                  {slots.map((src, i) => (
                    <PhoneFrame
                      key={i}
                      src={src}
                      logo={logo}
                      title={title}
                      screenshotMockup={screenshotMockup}
                      gradient={
                        PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length]
                      }
                      delay={i}
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
            </motion.div>
          )}
        </AnimatePresence>
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Root>
  );
}

function PhoneFrame({
  src,
  logo,
  title,
  screenshotMockup,
  gradient,
  delay,
}: {
  src: WorkImageAsset | null;
  logo?: WorkLogoAsset;
  title: string;
  screenshotMockup?: ScreenshotMockupKind;
  gradient: string;
  delay: number;
}) {
  const useIphone17 =
    Boolean(src) &&
    screenshotMockup === "iphone-17-pro" &&
    !(typeof src === "string" && isVideoAsset(src));

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.25,
          delay: 0.05 + delay * 0.05,
          ease: [0.16, 1, 0.3, 1],
        },
      }}
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
    </motion.div>
  );
}
