import Image from "next/image";
import type { WorkLogoAsset } from "@/lib/types/types";
import { isPairedScreenshots } from "@/lib/work-image";

type WorkLogoMarkProps = {
  logo: WorkLogoAsset;
  /** Tailwind size classes, e.g. h-9 w-9 or h-7 w-7 */
  boxClassName?: string;
  imagePadClassName?: string;
};

export function WorkLogoMark({
  logo,
  boxClassName = "h-9 w-9",
  imagePadClassName = "p-1.5",
}: WorkLogoMarkProps) {
  return (
    <span
      className={`relative shrink-0 overflow-hidden rounded-md bg-muted/40 ${boxClassName}`}
    >
      {isPairedScreenshots(logo) ? (
        <>
          <Image
            src={logo.light}
            alt=""
            fill
            className={`object-contain dark:hidden ${imagePadClassName}`}
          />
          <Image
            src={logo.dark}
            alt=""
            fill
            className={`hidden object-contain dark:block ${imagePadClassName}`}
          />
        </>
      ) : (
        <Image
          src={logo}
          alt=""
          fill
          className={`object-contain ${imagePadClassName}`}
        />
      )}
    </span>
  );
}
