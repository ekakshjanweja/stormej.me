import BodyLarge from "@/components/styles/body-large";
import HeadlineSmall from "@/components/styles/headline-small";
import Label from "@/components/styles/label";
import Link from "next/link";
import { SectionType } from "./section";

interface CardProps {
  title: string;
  role?: string;
  date: string;
  description: string;
  href: string;
  sectionType?: SectionType;
  tech?: string;
}

export default function Card({
  title,
  role,
  date,
  description,
  href,
  sectionType,
  tech,
}: CardProps) {
  return (
    <>
      <Link
        href={href}
        target={
          sectionType == null ||
          sectionType == SectionType.work ||
          sectionType == SectionType.project
            ? "_parent"
            : "_blank"
        }
        className="group"
      >
        <div className="mt-8 space-y-1">
          <HeadlineSmall text={title} />
          <Label text={sectionType == SectionType.work ? role! + date : date} />
          {/* TODO: Add description and tech */}
          {/* <BodyLarge text={description} />
          {sectionType == SectionType.project && <Label text={tech!} />} */}
        </div>
      </Link>
    </>
  );
}
