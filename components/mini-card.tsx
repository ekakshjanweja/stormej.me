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
          className="px-2 my-2 py-1 bg-highlight hover:bg-foreground text-card text-sm rounded-md opacity-95 hover:opacity-100 transition-all duration-300 ease-in-out"
          target="_blank"
        >
          {text}
        </Link>
      ) : (
        <span className="pr-1 sm:px-2 sm:my-2 py-1 bg-foreground/10 text-foreground text-xs sm:rounded-md">
          {text}
        </span>
      )}
    </>
  );
}
