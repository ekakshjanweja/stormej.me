import Link from "next/link";
import { ModeToggle } from "./theme-toggle";

export const Navbar = () => {
  return (
    <>
      <nav className="w-full h-32 flex items-center justify-between text-muted-foreground">
        <div className="text-muted-foreground">stormej</div>
        <div className="flex items-center gap-x-4">
          <Link href="/">
            <div className="hover:underline hover:underline-offset-4 text-muted-foreground">blogs</div>
          </Link>
          <ModeToggle></ModeToggle>
        </div>
      </nav>
    </>
  );
};
