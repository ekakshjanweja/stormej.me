import Link from "next/link";

export const HighlightedText = (
  label: string,
  link?: string,
  altText?: string,
  className?: string
) => {
  return (
    <div
      className={
        className + " flex items-center justify-center text-highlight space-x-4"
      }
    >
      {link != null ? (
        <Link href={link} target={link == "/gear" ? "_parent" : "_blank"}>
          <p>{label}</p>
        </Link>
      ) : (
        <p>{label}</p>
      )}
      {altText && (
        <p className="text-xs font-light text-muted-foreground">{altText}</p>
      )}
    </div>
  );
};
