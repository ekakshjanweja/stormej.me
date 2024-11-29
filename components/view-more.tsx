import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function ViewMore({
  title,
  subTitle,
  href,
}: {
  title: string;
  subTitle?: string;
  href?: string;
}) {
  return (
    <>
      {href ? (
        <Link href={href}>
          <div className="group flex text-highlight items-center justify-start mt-4">
            <p className="group-hover:underline transition-all duration-300 ease-in-out">
              {title}
            </p>
            <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:scale-90 transition-all duration-200 ease-in-out" />
          </div>

          {subTitle && <p className="opacity-50 text-xs">{subTitle}</p>}
        </Link>
      ) : (
        <div>
          <div className="group flex text-highlight items-center justify-start mt-4">
            <p className="group-hover:underline transition-all duration-300 ease-in-out">
              {title}
            </p>
            <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:scale-90 transition-all duration-200 ease-in-out" />
          </div>
          {subTitle && <p className="opacity-50 text-xs">{subTitle}</p>}
        </div>
      )}
    </>
  );
}
