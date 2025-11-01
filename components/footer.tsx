"use client";

import { ModeToggle } from "@/components/mode-toggle";
import X from "@/components/x";
import Github from "@/components/github";
import LinkedIn from "@/components/linkedin";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-border/40 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Social Links and Theme Toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Social Media Icons */}
            <nav aria-label="Social media links">
              <div className="flex items-center gap-4">
                <div className="group">
                  <X className="transition-all duration-300 group-hover:scale-110" />
                </div>
                <div className="group">
                  <Github className="transition-all duration-300 group-hover:scale-110" />
                </div>
                <div className="group">
                  <LinkedIn className="transition-all duration-300 group-hover:scale-110" />
                </div>
              </div>
            </nav>

            {/* Divider */}
            <div
              className="hidden sm:block h-6 w-px bg-border/40"
              aria-hidden="true"
            />
            <div
              className="sm:hidden h-px w-16 bg-border/40"
              aria-hidden="true"
            />

            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <ModeToggle />
            </div>
          </div>

          {/* Copyright and Location */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} - new delhi
            </p>
            <p className="text-sm font-medium text-foreground">stormej</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
