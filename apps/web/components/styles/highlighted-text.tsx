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
        <div className="relative group">
          <Link 
            href={link} 
            target={link == "/gear" ? "_parent" : "_blank"}
            className="relative z-10 transition-all duration-300 hover:text-highlight"
          >
            <p>{label}</p>
          </Link>
          
          {/* Gradient background effects for links */}
          <div className="absolute -inset-2 bg-gradient-to-r from-highlight/10 to-accent/10 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10" />
          <div className="absolute -inset-1 bg-highlight/5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </div>
      ) : (
        <p>{label}</p>
      )}
      {altText && (
        <p className="text-xs font-light text-muted-foreground">{altText}</p>
      )}
    </div>
  );
};
