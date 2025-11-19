"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => {
        if (mounted) {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
        }
      }}
      className={cn(
        "group relative",
        "w-8 h-8 rounded-lg",
        "flex items-center justify-center",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
        "border border-transparent",
        "text-muted-foreground hover:text-foreground hover:border-border/20 hover:bg-accent/10"
      )}
      aria-label={
        mounted && resolvedTheme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      disabled={!mounted}
    >
      {mounted ? (
        <>
          <Sun
            className={cn(
              "w-4 h-4 absolute transition-all duration-300",
              resolvedTheme === "dark"
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-90 scale-0 opacity-0"
            )}
          />
          <Moon
            className={cn(
              "w-4 h-4 absolute transition-all duration-300",
              resolvedTheme === "dark"
                ? "-rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100"
            )}
          />
        </>
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </button>
  );
}
