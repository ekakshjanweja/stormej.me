import HeadlineMedium from "@/components/styles/headline-medium";
import Label from "@/components/styles/label";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type CardType = "work" | "project" | "blog";

interface CardProps {
  title: string;
  role?: string;
  date: string;
  description: string;
  href: string;
  type: CardType;
  shouldViewMore?: boolean;
  externalHref?: string;
}

export default function Card({
  title,
  role,
  date,
  description,
  href,
  type,
  shouldViewMore = false,
  externalHref,
}: CardProps) {
  // Determine the actual href and target based on type and shouldViewMore
  const actualHref = type === "project" && !shouldViewMore && externalHref 
    ? externalHref 
    : href;
  
  const target = type === "project" && !shouldViewMore
    ? "_blank"
    : "_parent";

  // Format label text based on type
  const labelText = type === "work" 
    ? `${role || ""} ${date}` 
    : `${role ? `${role} ` : ''}${date}`;

  return (
    <Link
      href={actualHref}
      target={target}
      className={cn(
        "group block w-full",
        "transition-all duration-300 ease-in-out",
        "hover:translate-x-1 focus:translate-x-1",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
        "rounded-lg p-1 -m-1" // Padding for focus ring
      )}
    >
      <article className={cn(
        "relative w-full py-8",
        "border-b border-border/30",
        "transition-all duration-300 ease-in-out",
        "group-hover:border-border/50 group-focus:border-border/50",
        "space-y-3",
        "hover:px-2"
      )}>
        <div className="space-y-2 relative z-10">
          <HeadlineMedium text={title} />
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            "group-hover:text-muted-foreground/80 group-focus:text-muted-foreground/80"
          )}>
            <Label text={labelText} />
          </div>
        </div>
        
        {/* Description */}
        <div className={cn(
          "text-sm text-muted-foreground/90 relative z-10",
          "transition-all duration-300 ease-in-out",
          "group-hover:text-muted-foreground group-focus:text-muted-foreground",
          "leading-relaxed"
        )}>
          {description}
        </div>
        
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-highlight/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10" />
      </article>
    </Link>
  );
}
