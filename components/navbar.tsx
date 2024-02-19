import { ModeToggle } from "./theme-toggle";

export const Navbar = () => {
  return (
    <>
      <nav className="w-full h-20 flex items-center justify-between text-muted-foreground">
        <div className="text-muted-foreground">stormej</div>
        <div className="flex items-center gap-x-4">
          <div className="text-muted-foreground">blogs</div>
          <ModeToggle></ModeToggle>
        </div>
      </nav>
    </>
  );
};
