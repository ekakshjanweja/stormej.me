"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { resume, valorant } from "@/lib/constants/links";
import { cn } from "@/lib/utils";
import { Menu, X as CloseIcon } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

const navItems = [
  { href: "/work", label: "work" },
  { href: "/projects", label: "projects" },
  { href: "/blog", label: "blog" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  // Handle body scroll locking when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to reset body overflow when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as HTMLElement;
        const mobileMenu = document.getElementById("mobile-menu");
        const menuButton = document.getElementById("mobile-menu-button");

        if (
          mobileMenu &&
          !mobileMenu.contains(target) &&
          menuButton &&
          !menuButton.contains(target)
        ) {
          closeMobileMenu();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close mobile menu with Escape key
      if (event.key === "Escape" && isMobileMenuOpen) {
        closeMobileMenu();
        return;
      }

      // Only handle keyboard shortcuts when mobile menu is closed and no modifier keys
      if (
        !isMobileMenuOpen &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !event.metaKey
      ) {
        switch (event.key.toLowerCase()) {
          case "h":
            router.push("/");
            break;
          case "w":
            router.push("/work");
            break;
          case "p":
            router.push("/projects");
            break;
          case "b":
            router.push("/blog");
            break;
          case "g":
            router.push("/gear");
            break;
          case "t":
            const currentTheme = document.documentElement.classList.contains(
              "dark"
            )
              ? "dark"
              : "light";
            setTheme(currentTheme === "dark" ? "light" : "dark");
            break;
          case "r":
            window.open(resume, "_blank");
            break;
          case "v":
            window.open(valorant, "_blank");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, setTheme, isMobileMenuOpen]);

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-50 px-4 py-4 md:px-0 mb-8 flex items-center justify-between text-sm transition-all duration-300 ease-in-out",
          "border-b border-border/30",
          "bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80"
        )}
      >
        {/* Name/Brand */}
        <Link
          href="/"
          className={cn(
            "group flex items-center",
            "text-sm md:text-base font-semibold tracking-tight",
            "text-foreground hover:text-primary",
            "transition-all duration-200 ease-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded",
            "ml-4"
          )}
        >
          ekaksh janweja
        </Link>

        {/* Desktop Navigation Links and Theme Toggle */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isExternal = item.label === "resume";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative",
                  "px-2.5 py-1.5 rounded-lg",
                  "text-xs md:text-sm font-medium",
                  "transition-all duration-200 ease-out",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
                  "border border-transparent",
                  isActive
                    ? "text-foreground border-border/20 bg-muted/30"
                    : "text-muted-foreground hover:text-foreground hover:border-border/20 hover:bg-accent/10"
                )}
                target={isExternal ? "_blank" : "_parent"}
                rel={isExternal ? "noopener noreferrer" : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
                {isExternal && (
                  <span className="ml-1 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                    ↗
                  </span>
                )}
              </Link>
            );
          })}
          <div className="ml-2">
            <ModeToggle />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <button
            id="mobile-menu-button"
            onClick={toggleMobileMenu}
            className={cn(
              "p-2 -mr-2 rounded-lg",
              "text-muted-foreground hover:text-foreground",
              "transition-all duration-200 ease-out",
              "hover:bg-accent/20 active:bg-accent/30",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
            )}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <CloseIcon className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className={cn(
            "md:hidden fixed inset-0 z-50",
            "bg-background/95 backdrop-blur-lg",
            "transition-all duration-300 ease-in-out"
          )}
        >
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button
              onClick={closeMobileMenu}
              className={cn(
                "p-2 rounded-lg",
                "text-muted-foreground hover:text-foreground",
                "transition-all duration-200 ease-out",
                "hover:bg-accent/20 active:bg-accent/30",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
              )}
              aria-label="Close mobile menu"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
          <div
            className={cn(
              "flex flex-col",
              "p-6 pt-4",
              "max-w-sm mx-auto",
              "space-y-2"
            )}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isExternal = item.label === "resume";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "group relative",
                    "px-4 py-3 rounded-lg",
                    "text-sm font-medium",
                    "transition-all duration-200 ease-out",
                    "border border-transparent",
                    isActive
                      ? "text-foreground border-border/20 bg-muted/30"
                      : "text-muted-foreground hover:text-foreground hover:border-border/20 hover:bg-accent/10"
                  )}
                  target={isExternal ? "_blank" : "_parent"}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                  {isExternal && (
                    <span className="ml-1.5 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                      ↗
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
