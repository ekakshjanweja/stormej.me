"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { encode } from "qss";
import * as React from "react";
import { cn } from "@/lib/utils";

type LinkPreviewProps = {
  children: React.ReactNode;
  url: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
} & (
  | { isStatic: true; imageSrc: string }
  | { isStatic?: false; imageSrc?: never }
);

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export const LinkPreview = ({
  children,
  url,
  className,
  width = 240,
  height = 150,
  quality = 60,
  isStatic = false,
  imageSrc = "",
}: LinkPreviewProps) => {
  const src = isStatic
    ? imageSrc
    : `https://api.microlink.io/?${encode({
        url,
        screenshot: true,
        meta: false,
        embed: "screenshot.url",
        colorScheme: "dark",
        "viewport.isMobile": true,
        "viewport.deviceScaleFactor": 1,
        "viewport.width": width * 3,
        "viewport.height": height * 3,
      })}`;

  const hostname = getHostname(url);

  const [isOpen, setOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const x = useMotionValue(0);
  const translateX = useSpring(x, { stiffness: 200, damping: 24, mass: 0.6 });

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const targetRect = event.currentTarget.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 4;
    x.set(offsetFromCenter);
  };

  return (
    <>
      {isMounted ? (
        <div className="hidden">
          <Image
            src={src}
            width={width}
            height={height}
            quality={quality}
            priority
            alt=""
          />
        </div>
      ) : null}

      <HoverCardPrimitive.Root
        openDelay={120}
        closeDelay={120}
        onOpenChange={(open) => setOpen(open)}
      >
        <HoverCardPrimitive.Trigger
          onMouseMove={handleMouseMove}
          className={cn(className)}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          asChild
        >
          <Link href={url} target="_blank" rel="noopener noreferrer">
            {children}
          </Link>
        </HoverCardPrimitive.Trigger>

        <HoverCardPrimitive.Content
          className="z-50 origin-[--radix-hover-card-content-transform-origin]"
          side="top"
          align="center"
          sideOffset={10}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
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
                style={{ x: translateX }}
              >
                <Link
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-md border border-border bg-popover transition-colors duration-150 hover:border-foreground/30"
                >
                  <div
                    className="relative bg-background"
                    style={{ width, height }}
                  >
                    <Image
                      src={isStatic ? imageSrc : src}
                      width={width}
                      height={height}
                      quality={quality}
                      priority
                      alt={`Preview of ${hostname}`}
                      className="block"
                    />
                  </div>
                  <div className="border-t border-border/70 px-2.5 py-1.5">
                    <span className="meta-tag truncate normal-case tracking-[0.08em]">
                      {hostname}
                    </span>
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Root>
    </>
  );
};
