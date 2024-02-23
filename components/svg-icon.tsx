import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

interface SVGIconProps {
  href: string;
  iconLight: string;
  iconDark: string;
}

export const SVGIcon = ({
  href: href,
  iconLight: iconLight,
  iconDark: iconDark,
}: SVGIconProps) => {
  return (
    <>
      <div className="mt-4 flex items-center opacity-50 hover:opacity-80">
        <Link href={href} target="_blank">
          <Button variant="ghost" size="icon">
            <Image
              src={iconLight}
              alt="IconDark"
              className="absolute h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <Image
              src={iconDark}
              alt="IconLight"
              className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
          </Button>
        </Link>
      </div>
    </>
  );
};
