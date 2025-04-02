import Link from "next/link";
import React from "react";

export interface LabelProps {
  text: string;
  icon?: JSX.Element;
  href?: string;
  hrefText?: string;
  className?: string;
}

export default function Label({
  text,
  icon,
  href,
  hrefText,
  className,
}: LabelProps) {
  return (
    <>
      <div
        className={
          className +
          " flex text-muted-foreground gap-x-2 items-center text-xs md:text-sm"
        }
      >
        {icon}
        <div className="flex gap-x-4 items-center">
          <p> {text}</p>
          {href && (
            <Link href={href} target="_blank">
              <p className="hover:underline hover:text-highlight transition-all duration-300 ease-in-out">
                {hrefText}
              </p>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
