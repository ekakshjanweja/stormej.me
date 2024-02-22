"use client";

import Link from "next/link";
import { ModeToggle } from "./theme-toggle";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const pathName = usePathname();

  const isHome = pathName === "/";

  return (
    <>
      <nav className="w-full h-32 flex items-center justify-between text-muted-foreground">
        <Link href="/">
          <div className="text-muted-foreground">
            {isHome ? "stormej" : "back"}
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
