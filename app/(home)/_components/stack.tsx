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

export default function Stack() {
  const stack = [
    { name: "flutter", icon: Flutter },
    { name: "dart", icon: Dart },
    { name: "typescript", icon: Typescript },
    { name: "next.js", icon: Nextjs },
    { name: "tailwindcss", icon: Tailwindcss },
    { name: "bun", icon: Bun },
    { name: "hono", icon: Hono },
  ];

  return (
    <section data-cursor-anchor="stack">
      <h2 className="section-label mb-6">stack</h2>
      <div className="flex flex-wrap items-center gap-6">
        <TooltipProvider>
          {stack.map((tech) => (
            <Tooltip key={tech.name}>
              <TooltipTrigger className="hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded">
                <tech.icon className="h-4 w-4 text-foreground" />
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
