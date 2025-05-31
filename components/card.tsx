import HeadlineSmall from "@/components/styles/headline-small";
import Label from "@/components/styles/label";
import Link from "next/link";
import { SectionType } from "./section";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  role?: string;
  date: string;
  description: string;
  href: string;
  sectionType?: SectionType;
  tech?: string;
  shouldViewMore?: boolean;
  projectHref?: string;
}

export default function Card({
  title,
  role,
  date,
  href,
  sectionType,
  shouldViewMore,
  projectHref,
}: CardProps) {
  // For projects, determine the actual href and target based on shouldViewMore
  const actualHref = sectionType === SectionType.project && shouldViewMore === false 
    ? projectHref || href 
    : href;
  
  const target = sectionType === SectionType.project && shouldViewMore === false
    ? "_blank"
    : (sectionType == null ||
      sectionType == SectionType.work ||
      sectionType == SectionType.project
        ? "_parent"
        : "_blank");

  return (
    <Link
      href={actualHref}
      target={target}
      className={cn(
        "group block w-full relative",
        "transition-all duration-300 ease-in-out",
        "hover:translate-x-1 focus:translate-x-1",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
        "rounded-lg p-1 -m-1" // Padding for focus ring
      )}
    >
      <article className={cn(
        "relative w-full py-8 px-2",
        "border-b border-border/30",
        "transition-all duration-300 ease-in-out",
        "group-hover:border-border/50 group-focus:border-border/50",
        "space-y-3"
      )}>
        <div className="space-y-2 relative z-10">
          <HeadlineSmall text={title} />
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            "group-hover:text-muted-foreground/80 group-focus:text-muted-foreground/80"
          )}>
            <Label text={sectionType == SectionType.work ? (role || "") + date : date} />
          </div>
        </div>
        
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-highlight/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10" />
      </article>
    </Link>
  );
}
