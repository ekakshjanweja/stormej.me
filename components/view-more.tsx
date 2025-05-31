import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ViewMore({
  title,
  subTitle,
  href,
}: {
  title: string;
  subTitle?: string;
  href?: string;
}) {
  const content = (
    <div className={cn(
      "group relative",
      "transition-all duration-300 ease-in-out",
      "hover:translate-x-1 focus:translate-x-1",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
      "rounded-lg p-2 -m-2" // Padding for focus ring and hover area
    )}>
      <div className="flex text-highlight items-center justify-start gap-1 relative z-10">
        <p className={cn(
          "group-hover:underline transition-all duration-300 ease-in-out",
          "text-sm font-medium"
        )}>
          {title}
        </p>
        <ArrowUpRight className={cn(
          "h-4 w-4",
          "group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-95",
          "transition-all duration-200 ease-in-out"
        )} />
      </div>

      {subTitle && (
        <p className={cn(
          "opacity-60 text-xs mt-0.5 relative z-10",
          "transition-opacity duration-300 ease-in-out",
          "group-hover:opacity-80"
        )}>
          {subTitle}
        </p>
      )}
      
      {/* Gradient background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-highlight/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10" />
      <div className="absolute -inset-1 bg-gradient-to-br from-highlight/10 via-transparent to-muted/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-20 blur-sm group-hover:blur-none" />
    </div>
  );

  return href ? (
    <Link href={href} className="inline-block">
      {content}
    </Link>
  ) : (
    <div className="inline-block">
      {content}
    </div>
  );
}
