import BodyLarge from "@/components/styles/body-large";
import HeadlineSmall from "@/components/styles/headline-small";
import Label from "@/components/styles/label";
import Link from "next/link";

interface CardProps {
  title: string;
  role: string;
  date: string;
  description: string;
  href: string;
}

export default function Card({
  title,
  role,
  date,
  description,
  href,
}: CardProps) {
  return (
    <>
      <Link href={href} target="_blank" className="group">
        <div className="mt-8 space-y-1">
          <HeadlineSmall text={title} />
          <Label text={role + date} />
          <BodyLarge text={description} />
        </div>
      </Link>
    </>
  );
}
