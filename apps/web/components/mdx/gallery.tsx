import Image from "next/image";
import { cn } from "@/lib/utils";

type GalleryItem =
  | string
  | { light: string; dark: string }
  | { src: string | { light: string; dark: string }; alt?: string; caption?: string };

function normalize(item: GalleryItem) {
  if (typeof item === "string") return { src: item as string, alt: "", caption: undefined };
  if ("src" in item) return { src: item.src, alt: item.alt ?? "", caption: item.caption };
  return { src: item, alt: "", caption: undefined };
}

export function Gallery({
  items,
  columns = 2,
  className,
}: {
  items: GalleryItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  if (!items || items.length === 0) return null;

  const colsClass =
    columns === 4
      ? "sm:grid-cols-2 md:grid-cols-4"
      : columns === 3
        ? "sm:grid-cols-2 md:grid-cols-3"
        : "sm:grid-cols-2";

  return (
    <div className={cn("my-8 grid grid-cols-1 gap-4", colsClass, className)}>
      {items.map((raw, i) => {
        const { src, alt, caption } = normalize(raw);
        return (
          <figure key={i} className="space-y-2">
            <div className="overflow-hidden rounded-xl border border-border/40 bg-muted/[0.12]">
              {typeof src === "string" ? (
                <Image
                  src={src}
                  alt={alt}
                  width={1200}
                  height={800}
                  className="h-auto w-full object-cover"
                />
              ) : (
                <>
                  <Image
                    src={src.light}
                    alt={alt}
                    width={1200}
                    height={800}
                    className="h-auto w-full object-cover dark:hidden"
                  />
                  <Image
                    src={src.dark}
                    alt={alt}
                    width={1200}
                    height={800}
                    className="hidden h-auto w-full object-cover dark:block"
                  />
                </>
              )}
            </div>
            {caption && (
              <figcaption className="text-[12px] font-light text-muted-foreground">
                {caption}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
