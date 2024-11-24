import { work } from "@/lib/constants/work";
import Card from "./card";
import HeadlineMedium from "./styles/headline-medium";
import { projects } from "@/lib/constants/projects";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export enum SectionType {
  work,
  project,
}

const sectionTitle = (type: SectionType) => {
  switch (type) {
    case SectionType.work:
      return "work";
    case SectionType.project:
      return "projects";
  }
};

const sectionArray = (sectionType: SectionType) => {
  switch (sectionType) {
    case SectionType.work:
      return work;
    case SectionType.project:
      return projects;
  }
};

const sectionViewMore = (sectionType: SectionType) => {
  switch (sectionType) {
    case SectionType.work:
      return "view more";
    case SectionType.project:
      return "all projects";
  }
};

const sectionViewMoreHref = (sectionType: SectionType) => {
  switch (sectionType) {
    case SectionType.work:
      return "/work";
    case SectionType.project:
      return "/projects";
  }
};

export default function Section({ sectionType }: { sectionType: SectionType }) {
  return (
    <div className="mt-12">
      <HeadlineMedium text={sectionTitle(sectionType)} showAsterisk />

      <div
        className={cn(
          sectionType == SectionType.project &&
            "grid grid-cols-1 md:grid-cols-2 gap-x-4"
        )}
      >
        {sectionArray(sectionType)
          .slice(0, 2)
          .map((item, index) => (
            <>
              <Card
                key={index}
                title={item.title}
                role={item.role}
                date={item.date}
                description={item.description}
                href={item.href}
                sectionType={sectionType}
                tech={item.tech}
              />
            </>
          ))}
      </div>

      {sectionArray(sectionType).length > 2 && (
        <>
          <Link href={sectionViewMoreHref(sectionType)}>
            <div className="group flex text-highlight items-center justify-start mt-8">
              <p className="group-hover:underline transition-all duration-300 ease-in-out">
                {sectionViewMore(sectionType)}
              </p>
              <ArrowUpRight className="h-5 w-5 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:scale-90 transition-all duration-200 ease-in-out" />{" "}
            </div>

            <p className="opacity-50 text-xs">
              {`(${sectionArray(sectionType).length})`}
            </p>
          </Link>
        </>
      )}
    </div>
  );
}
