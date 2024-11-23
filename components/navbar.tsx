"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

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
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey) {
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
            router.push("/blogs");
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
            window.open(
              "https://drive.google.com/file/d/1JBoUUrkOV0H3LnLFNcUy-uhhjMAnWRiV/view",
              "_blank"
            );
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  return (
    <nav className="flex items-center justify-between mt-4 mb-12 text-sm">
      {/* Desktop Menu */}
      <div className="flex space-x-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`hover:text-highlight ${
              pathname === item.href ? "text-highlight" : ""
            }`}
          >
            [{item.label.charAt(0)}] {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
