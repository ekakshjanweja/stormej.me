import Link from "next/link";
import { TextScramble } from "../ui/text-scramble";

export default function HeadlineLarge({
  text,
  className,
  showAsterisk,
  href,
}: {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  href?: string;
}) {
  return (
    <>
      {href != null ? (
        <>
          <Link href={href!} target="_blank">
            <div className="flex group">
              {showAsterisk && (
                <p className="text-2xl sm:text-3xl lg:text-4xl text-highlight mr-2 group-hover:text-foreground transition-all duration-300 ease-in-out">
                  *
                </p>
              )}
              <TextScramble
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 group-hover:text-highlight transition-all duration-300 ease-in-out ${className || ""}`}
              >
                {text}
              </TextScramble>
            </div>
          </Link>
        </>
      ) : (
        <div className="flex">
          {showAsterisk && <p className="text-2xl sm:text-3xl lg:text-4xl text-highlight mr-2">*</p>}
          <TextScramble className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 ${className || ""}`}>
            {text}
          </TextScramble>
        </div>
      )}
    </>
  );
}
