import Link from "next/link";
import { ModeToggle } from "./theme-toggle";

export const Navbar = () => {
  return (
    <>
      <nav className="w-full h-32 flex items-center justify-between text-muted-foreground">
        <div className="text-muted-foreground">stormej</div>
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

          <ModeToggle/>
        </div>
      </nav>
    </>
  );
};
