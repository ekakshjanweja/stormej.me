import { ModeToggle } from "./theme-toggle";

export const Navbar = () => {
  return (
    <>
      <nav className="w-full h-20 flex items-center justify-between text-muted-foreground">
        <div className="hover:text-stone-100">stormej</div>
        <div className="flex items-center gap-x-4">
          <div className="hover:text-stone-100">blogs</div>
          <ModeToggle></ModeToggle>
        </div>
      </nav>
    </>
  );
};
