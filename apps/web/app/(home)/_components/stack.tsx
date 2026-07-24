import { Arch } from "@/components/ui/svgs/arch";
import { Bun } from "@/components/ui/svgs/bun";
import { Dart } from "@/components/ui/svgs/dart";
import { Flutter } from "@/components/ui/svgs/flutter";
import { Hono } from "@/components/ui/svgs/hono";
import { NextjsIconDark as Nextjs } from "@/components/ui/svgs/nextjs-icon-dark";
import { Tailwindcss } from "@/components/ui/svgs/tailwindcss";
import { Typescript } from "@/components/ui/svgs/typescript";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Stack() {
	const stack = [
		{ icon: Flutter, name: "flutter" },
		{ icon: Dart, name: "dart" },
		{ icon: Typescript, name: "typescript" },
		{ icon: Nextjs, name: "next.js" },
		{ icon: Tailwindcss, name: "tailwindcss" },
		{ icon: Bun, name: "bun" },
		{ icon: Hono, name: "hono" },
		{ icon: Arch, name: "arch linux (on the desktop)" },
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
								<span className="font-light text-[12px] text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
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
