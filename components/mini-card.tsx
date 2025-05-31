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
          className="group relative inline-block px-3 py-1.5 bg-highlight hover:bg-foreground text-card text-sm rounded-md opacity-95 hover:opacity-100 transition-all duration-300 ease-in-out transform hover:scale-105"
          target="_blank"
        >
          <span className="relative z-10">{text}</span>
        </Link>
      ) : (
        <span className="inline-block px-2 py-1 bg-foreground/10 text-foreground text-sm rounded-md whitespace-nowrap">
          {text}
        </span>
      )}
    </>
  );
}
