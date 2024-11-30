import { work, WorkEntryType } from "@/lib/constants/work";
import Card from "./card";
import HeadlineMedium from "./styles/headline-medium";
import { projects } from "@/lib/constants/projects";
import { cn } from "@/lib/utils";
import ViewMore from "./view-more";

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

      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-x-4")}>
        {sectionArray(sectionType)
          .slice(0, 3)
          .map((item, index) => (
            <>
              <Card
                key={index}
                title={item.title}
                role={item.role}
                date={item.date}
                description={
                  sectionType == SectionType.work
                    ? (item as WorkEntryType).subtitle
                    : item.description
                }
                href={
                  sectionType == SectionType.work
                    ? `/work/${(item as WorkEntryType).id}`
                    : `/projects/${item.title}`
                }
                sectionType={sectionType}
                tech={item.tech}
              />
            </>
          ))}
      </div>

      {sectionArray(sectionType).length > 3 && (
        <>
          <ViewMore
            title={sectionViewMore(sectionType)}
            href={sectionViewMoreHref(sectionType)}
            subTitle={`(${sectionArray(sectionType).length})`}
          />
        </>
      )}
    </div>
  );
}
