import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bun } from "@/components/ui/svgs/bun";
import { Dart } from "@/components/ui/svgs/dart";
import { Flutter } from "@/components/ui/svgs/flutter";
import { NextjsIconDark as Nextjs } from "@/components/ui/svgs/nextjsIconDark";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Hono } from "@/components/ui/svgs/hono";
import { Tailwindcss } from "@/components/ui/svgs/tailwindcss";
import { Arch } from "@/components/ui/svgs/arch";

export default function Stack() {
  const stack = [
    { name: "flutter", icon: Flutter },
    { name: "dart", icon: Dart },
    { name: "typescript", icon: Typescript },
    { name: "next.js", icon: Nextjs },
    { name: "tailwindcss", icon: Tailwindcss },
    { name: "bun", icon: Bun },
    { name: "hono", icon: Hono },
    { name: "arch linux (on the desktop)", icon: Arch },
  ];

  return (
    <section data-cursor-anchor="stack">
      <h2 className="section-label mb-6">stack</h2>
      <div className="flex flex-wrap gap-3">
        <TooltipProvider>
          {stack.map((tech) => (
            <Tooltip key={tech.name}>
              <TooltipTrigger className="group relative inline-flex h-10 items-center gap-2 rounded-full border border-border/40 bg-background px-4 py-2 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-border/70 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2">
                <tech.icon className="h-4 w-4 text-muted-foreground transition-colors duration-150 group-hover:text-foreground" />
                <span className="text-[12px] font-light text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
                  {tech.name}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tech.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </section>
  );
}