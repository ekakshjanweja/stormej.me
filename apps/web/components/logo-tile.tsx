"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { WorkLogoAsset } from "@/lib/types/types";
import { isPairedScreenshots } from "@/lib/work-image";

type Props = {
  src: WorkLogoAsset;
  alt?: string;
  size?: number;
  boxClassName?: string;
  imagePadClassName?: string;
  className?: string;
};

export function LogoTile({
  src,
  alt = "",
  size,
  boxClassName,
  imagePadClassName = "p-1.5",
  className,
}: Props) {
  const [bg, setBg] = useState<string | null>(null);
  const cancelled = useRef(false);
  const sampleSrc = isPairedScreenshots(src) ? src.light : src;
  const usingClassSize = Boolean(boxClassName);
  const fallbackSize = size ?? 32;

  useEffect(() => {
    cancelled.current = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = sampleSrc;
    img.onload = () => {
      if (cancelled.current) return;
      try {
        const s = 32;
        const canvas = document.createElement("canvas");
        canvas.width = s;
        canvas.height = s;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, s, s);
        const { data } = ctx.getImageData(0, 0, s, s);
        const buckets = new Map<string, { r: number; g: number; b: number; n: number; score: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 200) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          const lum = (r + g + b) / 3;
          if (lum > 240 || lum < 15) continue;
          const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
          const cur = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, score: 0 };
          cur.r += r;
          cur.g += g;
          cur.b += b;
          cur.n += 1;
          cur.score += 1 + sat * 2;
          buckets.set(key, cur);
        }
        let best: { r: number; g: number; b: number; n: number; score: number } | null = null;
        for (const v of buckets.values()) {
          if (!best || v.score > best.score) best = v;
        }
        if (!best) return;
        const r = Math.round(best.r / best.n);
        const g = Math.round(best.g / best.n);
        const b = Math.round(best.b / best.n);
        setBg(`rgb(${r} ${g} ${b} / 0.15)`);
      } catch {
        // ignore (CORS, decode errors)
      }
    };
    return () => {
      cancelled.current = true;
    };
  }, [sampleSrc]);

  const sizesAttr = usingClassSize ? undefined : `${fallbackSize}px`;

  return (
    <span
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md transition-colors duration-300",
        bg ? "" : "bg-muted/40",
        boxClassName,
        className,
      )}
      style={
        usingClassSize
          ? { backgroundColor: bg ?? undefined }
          : {
              width: fallbackSize,
              height: fallbackSize,
              backgroundColor: bg ?? undefined,
            }
      }
    >
      {isPairedScreenshots(src) ? (
        <>
          <Image
            src={src.light}
            alt={alt}
            fill
            sizes={sizesAttr}
            className={cn("object-contain dark:hidden", imagePadClassName)}
          />
          <Image
            src={src.dark}
            alt={alt}
            fill
            sizes={sizesAttr}
            className={cn("hidden object-contain dark:block", imagePadClassName)}
          />
        </>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizesAttr}
          className={cn("object-contain", imagePadClassName)}
        />
      )}
    </span>
  );
}
