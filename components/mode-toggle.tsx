"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative z-10 hover:bg-transparent hover:text-highlight transition-all duration-300"
        disabled
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setTheme(isDark ? "light" : "dark");
        }}
        className={cn(
          "relative z-10 hover:bg-transparent hover:text-highlight",
          "transition-all duration-300",
          "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
        )}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {/* Sun icon - visible in dark mode (indicates switching to light) */}
        <Sun
          className={cn(
            "h-5 w-5 absolute transition-all duration-300",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          )}
        />
        {/* Moon icon - visible in light mode (indicates switching to dark) */}
        <Moon
          className={cn(
            "h-5 w-5 absolute transition-all duration-300",
            isDark
              ? "-rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
      </Button>

      {/* Gradient background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-highlight/5 to-accent/5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10" />
      <div className="absolute -inset-1 bg-gradient-to-br from-highlight/10 via-transparent to-muted/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-20 blur-sm group-hover:blur-none" />
    </div>
  );
}
