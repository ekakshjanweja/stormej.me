"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { resume, valorant } from "@/lib/constants/links";

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
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
  }, [router, setTheme]);

  return (
    <nav className="flex items-center justify-between mb-12 text-xs sm:text-sm">
      {/* Desktop Menu */}
      <div className="flex space-x-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`hover:text-highlight transition-all duration-300 ease-in-out ${
              pathname === item.href ? "text-highlight" : ""
            }`}
            target={item.label === "resume" ? "_blank" : "_parent"}
          >
            [{item.label.charAt(0)}] {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
