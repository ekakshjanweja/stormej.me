import Image from "next/image";
import { cn } from "@/lib/utils";

type FigureSrc = string | { light: string; dark: string };

export function Figure({
  src,
  alt = "",
  caption,
  width = 1600,
  height = 1000,
  priority,
  className,
  rounded = true,
  bordered = true,
  fit = "contain",
}: {
  src: FigureSrc;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  rounded?: boolean;
  bordered?: boolean;
  fit?: "contain" | "cover";
}) {
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";
  const wrap = cn(
    "overflow-hidden bg-muted/[0.12]",
    rounded && "rounded-xl",
    bordered && "border border-border/40",
    className,
  );

  return (
    <figure className="my-8">
      <div className={wrap}>
        {typeof src === "string" ? (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            className={cn("h-auto w-full", fitClass)}
          />
        ) : (
          <>
            <Image
              src={src.light}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              className={cn("h-auto w-full dark:hidden", fitClass)}
            />
            <Image
              src={src.dark}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              className={cn("hidden h-auto w-full dark:block", fitClass)}
            />
          </>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-[12px] font-light text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
