import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MiniCard({
  text,
  href,
}: {
  text: string;
  href?: string;
}) {
  return (
    <>
      {href ? (
        <Link
          href={href}
          className={cn(
            "group relative inline-block px-3 py-1.5",
            "bg-highlight hover:bg-foreground",
            "text-card text-sm rounded-md",
            "opacity-95 hover:opacity-100",
            "transition-all duration-300 ease-out",
            "transform hover:scale-105",
            "shadow-sm hover:shadow-md",
            "transform-gpu",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="relative z-10">{text}</span>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-md bg-highlight/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
        </Link>
      ) : (
        <span className="inline-block px-2 py-1 bg-foreground/10 text-foreground text-sm rounded-md whitespace-nowrap">
          {text}
        </span>
      )}
    </>
  );
}
