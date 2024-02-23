"use client";

import Link from "next/link";
import { ModeToggle } from "./theme-toggle";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowLeftToLine, ChevronLeft } from "lucide-react";

export const Navbar = () => {
  const pathName = usePathname();

  const isHome = pathName === "/";

  return (
    <>
      <nav className="w-full h-32 flex items-center justify-between text-muted-foreground">
        <Link href="/">
          <div className="text-muted-foreground">
            {isHome ? (
              <div className="hover:text-foreground"> {"stormej"}</div>
            ) : (
              <div className="flex items-center justify-center gap-x-2 hover:text-foreground underline underline-offset-4">
                <ChevronLeft className="h-4 w-4" /> {"back"}
              </div>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-x-4">
          <Link href="/blogs">
            <div className="hover:underline hover:underline-offset-4 text-muted-foreground">
              blogs
            </div>
          </Link>
          <Link
            href="https://drive.google.com/file/d/1JBoUUrkOV0H3LnLFNcUy-uhhjMAnWRiV/view?usp=sharing"
            target="_blank"
          >
            <div className="hover:underline hover:underline-offset-4 text-muted-foreground">
              resume
            </div>
          </Link>

          <ModeToggle></ModeToggle>
        </div>
      </nav>
    </>
  );
};
