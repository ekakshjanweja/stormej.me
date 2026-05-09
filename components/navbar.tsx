"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { resume } from "@/lib/constants/links";
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

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        closeMobileMenu();
        return;
      }
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
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, setTheme, isMobileMenuOpen]);

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-50 px-4 py-5 mb-10",
          "flex items-center justify-between",
          "bg-background/85 backdrop-blur-md"
        )}
      >
        <Link
          href="/"
          className={cn(
            "text-[15px] font-normal tracking-tight text-foreground",
            "hover-dim",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
          )}
        >
          ekaksh janweja
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[15px] font-normal text-foreground transition-opacity duration-150",
                  isActive ? "opacity-100" : "opacity-60 hover:opacity-100",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <ModeToggle />
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ModeToggle />
          <button
            id="mobile-menu-button"
            onClick={toggleMobileMenu}
            className="p-2 -mr-2 text-foreground hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
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

      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-md"
        >
          <div className="flex justify-end p-4">
            <button
              onClick={closeMobileMenu}
              className="p-2 text-foreground hover-dim"
              aria-label="Close mobile menu"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col p-6 pt-4 max-w-sm mx-auto gap-5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "text-base font-normal text-foreground transition-opacity duration-150",
                    isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
