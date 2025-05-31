"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setTheme((theme) => (theme === "dark" ? "light" : "dark"));
        }}
        className="relative z-10 hover:bg-transparent hover:text-highlight transition-all duration-300"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
      
      {/* Gradient background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-highlight/5 to-accent/5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10" />
      <div className="absolute -inset-1 bg-gradient-to-br from-highlight/10 via-transparent to-muted/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-20 blur-sm group-hover:blur-none" />
    </div>
  );
}
