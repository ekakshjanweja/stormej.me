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
    <section className="mt-16 lg:mt-20">
      {/* Section Header */}
      <div className="mb-8 lg:mb-12">
        <HeadlineMedium text={sectionTitle(sectionType)} />
      </div>

      {/* Cards Grid */}
      <div className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-2",
        "transition-all duration-300 ease-in-out"
      )}>
        {sectionArray(sectionType)
          .slice(0, 4)
          .map((item, index) => (
            <div
              key={index}
              className={cn(
                "group relative",
                "transition-all duration-300 ease-in-out",
                "hover:scale-[1.02] hover:z-10",
                "focus-within:scale-[1.02] focus-within:z-10"
              )}
            >
              <Card
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
                type={sectionType == SectionType.work ? "work" : "project"}
                shouldViewMore={sectionType == SectionType.project ? (item as any).shouldViewMore : undefined}
                externalHref={sectionType == SectionType.project ? (item as any).href : undefined}
              />
            </div>
          ))}
      </div>

      {/* View More Section */}
      {sectionArray(sectionType).length > 4 && (
        <div className="mt-12 lg:mt-16">
          <ViewMore
            title={sectionViewMore(sectionType)}
            href={sectionViewMoreHref(sectionType)}
            subTitle={`(${sectionArray(sectionType).length})`}
          />
        </div>
      )}
    </section>
  );
}
