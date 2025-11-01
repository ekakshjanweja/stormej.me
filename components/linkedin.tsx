"use client";

import { linkedin } from "@/lib/constants/links";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LinkedIn({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Link
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit my LinkedIn profile"
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={resolvedTheme === "dark" ? "#ffffff" : "#000000"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={
            className +
            " h-4 hover:stroke-highlight hover:scale-125 transition-all duration-200"
          }
          aria-hidden="true"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      </Link>
    </>
  );
}
