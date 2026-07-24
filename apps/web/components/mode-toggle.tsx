"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function ModeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = useCallback(() => {
		if (!mounted) {
			return;
		}
		const next = resolvedTheme === "dark" ? "light" : "dark";
		track("theme_toggled", { source: "button", to: next });
		setTheme(next);
	}, [mounted, resolvedTheme, setTheme]);

	return (
		<button
			aria-label={
				mounted && resolvedTheme === "dark"
					? "Switch to light mode"
					: "Switch to dark mode"
			}
			className={cn(
				"group relative",
				"h-8 w-8 rounded-lg",
				"flex items-center justify-center",
				"transition-all duration-200 ease-out",
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
				"border border-transparent",
				"text-muted-foreground hover:border-border/20 hover:bg-accent/10 hover:text-foreground"
			)}
			disabled={!mounted}
			onClick={toggleTheme}
			type="button"
		>
			{mounted ? (
				<>
					<Sun
						className={cn(
							"absolute h-4 w-4 transition-all duration-300",
							resolvedTheme === "dark"
								? "rotate-0 scale-100 opacity-100"
								: "rotate-90 scale-0 opacity-0"
						)}
					/>
					<Moon
						className={cn(
							"absolute h-4 w-4 transition-all duration-300",
							resolvedTheme === "dark"
								? "-rotate-90 scale-0 opacity-0"
								: "rotate-0 scale-100 opacity-100"
						)}
					/>
				</>
			) : (
				<Sun className="h-4 w-4" />
			)}
		</button>
	);
}
