import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Bun } from "@/components/ui/svgs/bun";
import { Dart } from "@/components/ui/svgs/dart";
import { Flutter } from "@/components/ui/svgs/flutter";
import { NextjsIconDark as Nextjs } from "@/components/ui/svgs/nextjsIconDark";

import { Hono } from "@/components/ui/svgs/hono";
import { Tailwindcss } from "@/components/ui/svgs/tailwindcss";

export default function Stack() {
    const stack = [
        {
            name: "flutter",
            icon: Flutter,
        },
        {
            name: "dart",
            icon: Dart,
        },
        {
            name: "next.js",
            icon: Nextjs,
        },
        {
            name: "bun",
            icon: Bun,
        },
        {
            name: "hono",
            icon: Hono,
        },
        {
            name: "tailwindcss",
            icon: Tailwindcss,
        },
    ];

    return (
        <section className="mt-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                    stack
                </h2>
            </div>
            <div className="flex flex-wrap gap-4">
                <TooltipProvider>
                    {stack.map((tech) => (
                        <Tooltip key={tech.name}>
                            <TooltipTrigger>
                                <div
                                    className={cn(
                                        "group relative overflow-hidden rounded-md",
                                        "border border-border/10 bg-muted/20",
                                        "hover:border-border/50 dark:hover:border-border/40",
                                        "hover:bg-muted/40 dark:hover:bg-card/60",
                                        "backdrop-blur-sm transition-all duration-500 ease-in-out",
                                        "cursor-pointer p-3",
                                        "hover:shadow-sm hover:shadow-primary/10 dark:hover:shadow-primary/5",
                                        "transform-gpu"
                                    )}
                                >
                                    {/* Animated gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/5 dark:via-transparent dark:to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" />

                                    {/* Shimmer effect on hover */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-primary/5 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100" />

                                    <tech.icon className="relative z-10 h-5 w-5 text-muted-foreground opacity-70 group-hover:text-foreground group-hover:opacity-100 transition-all duration-300" />
                                </div>
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
