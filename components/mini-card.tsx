import Link from "next/link";

export default function MiniCard({
  text,
  href,
}: {
  text: string;
  href?: string;
}) {
  return (
    <>
      {href ? (
        <Link
          href={href}
          className="group relative px-2 my-2 py-1 bg-highlight hover:bg-foreground text-card text-sm rounded-md opacity-95 hover:opacity-100 transition-all duration-300 ease-in-out transform hover:scale-105 hover:rotate-1"
          target="_blank"
        >
          <span className="relative z-10">{text}</span>
          <div className="absolute -inset-1 bg-gradient-to-r from-highlight/20 to-accent/20 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 blur-sm group-hover:blur-none" />
        </Link>
      ) : (
        <span className="relative pr-1 sm:px-2 sm:my-2 py-1 bg-foreground/10 text-foreground text-xs sm:rounded-md">
          {text}
        </span>
      )}
    </>
  );
}
