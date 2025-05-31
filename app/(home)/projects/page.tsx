import HeadlineMedium from "@/components/styles/headline-medium";
import Label from "@/components/styles/label";
import { TextScramble } from "@/components/ui/text-scramble";
import { projects } from "@/lib/constants/projects";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Project() {
  return (
    <main className="container mx-auto px-4 py-8 lg:py-12">
      {/* Page Header */}
      <div className="mb-16 lg:mb-20">
        <TextScramble
          as="h1"
          className="text-3xl lg:text-4xl font-bold text-foreground"
        >
          projects
        </TextScramble>
        <p className="text-muted-foreground mt-2 text-sm lg:text-base">
          a collection of things i've built
        </p>
      </div>

      {/* Projects List */}
      <div className="space-y-2">
        {projects.map((item, index) => (
          <Link 
            href={item.shouldViewMore ? `/projects/${item.title}` : item.href} 
            key={index}
            target={item.shouldViewMore ? "_parent" : "_blank"}
            className={cn(
              "group block w-full",
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
                <HeadlineMedium text={item.title} />
                <div className={cn(
                  "transition-all duration-300 ease-in-out",
                  "group-hover:text-muted-foreground/80 group-focus:text-muted-foreground/80"
                )}>
                  <Label text={`${item.role ? `${item.role} ` : ''}${item.date}`} />
                </div>
              </div>
              
              {/* Project Description */}
              <div className={cn(
                "text-sm text-muted-foreground/90 relative z-10",
                "transition-all duration-300 ease-in-out",
                "group-hover:text-muted-foreground group-focus:text-muted-foreground",
                "leading-relaxed"
              )}>
                {item.description}
              </div>
              
              {/* Gradient background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-highlight/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10" />
            </article>
          </Link>
        ))}
      </div>
    </main>
  );
}
