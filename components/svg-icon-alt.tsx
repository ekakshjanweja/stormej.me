import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

interface SVGIconAltProps {
  href: string;
  iconLight: string;
  iconDark: string;
}

export const SVGIconAlt = ({
  href: href,
  iconLight: iconLight,
  iconDark: iconDark,
}: SVGIconAltProps) => {
  return (
    <>
      <div className="px-5 flex items-center justify-center opacity-50 hover:opacity-80">
        <Link href={href} target="_blank">
          <Image
            src={iconLight}
            alt="IconDark"
            className="absolute h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Image
            src={iconDark}
            alt="IconLight"
            className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
        </Link>
      </div>
    </>
  );
};
