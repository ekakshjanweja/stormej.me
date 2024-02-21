"use client";

import { cn } from "@/lib/utils";
import { useWindowSize } from "@/lib/window-size";
import { useEffect, useRef } from "react";

interface RadialGradientProps {
  children: React.ReactNode;
}

export const RadialGradient = ({ children }: RadialGradientProps) => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = ev;
      heroRef.current.style.setProperty("--x", `${clientX}px`);
      heroRef.current.style.setProperty("--y", `${clientY}px`);
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  const { width } = useWindowSize();

  if (width === undefined) {
    return;
  }

  return (
    <>
      <div
        ref={heroRef}
        className={cn(
          width > 1024
            ? "before:pointer-events-none before:fixed before:inset-0 before:z-0 before:bg-[radial-gradient(circle_farthest-side_at_var(--x,_100px)_var(--y,_100px),_var(--gradient-color)_0%,_transparent_20%)] before:opacity-30"
            : ""
        )}
      >
        {children}
      </div>
    </>
  );
};
