"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { resume, valorant } from "@/lib/constants/links";
import { cn } from "@/lib/utils";
import X from "@/components/x";
import Github from "@/components/github";
import LinkedIn from "@/components/linkedin";
import { Menu, X as CloseIcon } from "lucide-react";

const navItems = [
  { href: "/", label: "home" },
  { href: "/work", label: "work" },
  { href: "/projects", label: "projects" },
  { href: "/blog", label: "blog" },
  {
    href: "https://drive.google.com/file/d/1JBoUUrkOV0H3LnLFNcUy-uhhjMAnWRiV/view",
    label: "resume",
  },
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
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isExternal = item.label === "resume";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative",
                  "px-3 py-2 rounded-lg",
                  "transition-all duration-200 ease-out",
                  "hover:translate-x-0.5 focus:translate-x-0.5",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
                  "border border-transparent",
                  isActive
                    ? "text-highlight border-border/40 bg-accent/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:border-border/30 hover:bg-accent/15"
                )}
                target={isExternal ? "_blank" : "_parent"}
                rel={isExternal ? "noopener noreferrer" : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    "transition-all duration-300 ease-in-out"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-mono",
                      "transition-all duration-300 ease-in-out",
                      isActive
                        ? "text-highlight/80"
                        : "text-muted-foreground/60 group-hover:text-muted-foreground/80"
                    )}
                  >
                    [{item.label.charAt(0)}]
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      "transition-all duration-300 ease-in-out"
                    )}
                  >
                    {item.label}
                  </span>
                  {isExternal && (
                    <span
                      className={cn(
                        "text-xs",
                        "transition-all duration-300 ease-in-out",
                        "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      )}
                    >
                      ↗
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          id="mobile-menu-button"
          onClick={toggleMobileMenu}
          className={cn(
            "md:hidden",
            "p-2 -ml-2 rounded-lg",
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

        {/* Desktop Social Media Icons */}
        <div
          className={cn(
            "hidden md:flex items-center gap-2 lg:gap-3",
            "transition-all duration-300 ease-in-out"
          )}
        >
          <div
            className={cn(
              "group flex items-center gap-2 lg:gap-3",
              "p-1.5 -m-1.5 rounded-lg",
              "transition-all duration-200 ease-out",
              "hover:bg-accent/15"
            )}
          >
            <X className="transition-all duration-300 group-hover:scale-110" />
            <Github className="transition-all duration-300 group-hover:scale-110" />
            <LinkedIn className="transition-all duration-300 group-hover:scale-110" />
          </div>
        </div>

        {/* Mobile Social Media Icons */}
        <div
          className={cn(
            "md:hidden flex items-center gap-2",
            "transition-all duration-300 ease-in-out"
          )}
        >
          <div
            className={cn(
              "group flex items-center gap-2",
              "p-1 -m-1 rounded-lg",
              "transition-all duration-200 ease-out",
              "hover:bg-accent/15"
            )}
          >
            <X className="w-4 h-4 transition-all duration-300 group-hover:scale-110" />
            <Github className="w-4 h-4 transition-all duration-300 group-hover:scale-110" />
            <LinkedIn className="w-4 h-4 transition-all duration-300 group-hover:scale-110" />
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className={cn(
            "md:hidden fixed inset-0 z-50",
            "bg-background/95 backdrop-blur-md",
            "transition-all duration-300 ease-in-out"
          )}
        >
          <div
            className={cn(
              "flex flex-col",
              "p-6 pt-20",
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
                    "px-4 py-3 rounded-xl",
                    "transition-all duration-200 ease-out",
                    "border border-transparent",
                    "text-base",
                    isActive
                      ? "text-highlight border-border/40 bg-accent/30 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:border-border/30 hover:bg-accent/15"
                  )}
                  target={isExternal ? "_blank" : "_parent"}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "flex items-center gap-3",
                      "transition-all duration-300 ease-in-out"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-mono",
                        "transition-all duration-300 ease-in-out",
                        isActive
                          ? "text-highlight/80"
                          : "text-muted-foreground/60 group-hover:text-muted-foreground/80"
                      )}
                    >
                      [{item.label.charAt(0)}]
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        "transition-all duration-300 ease-in-out"
                      )}
                    >
                      {item.label}
                    </span>
                    {isExternal && (
                      <span
                        className={cn(
                          "text-sm ml-auto",
                          "transition-all duration-300 ease-in-out",
                          "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        )}
                      >
                        ↗
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
