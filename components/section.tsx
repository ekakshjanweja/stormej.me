import { work } from "@/content/work";
import Card from "./card";
import HeadlineMedium from "./styles/headline-medium";

export enum SectionType {
  work,
  project,
  blog,
}

const sectionTitle = (type: SectionType) => {
  switch (type) {
    case SectionType.work:
      return "work";
    case SectionType.project:
      return "projects";
    case SectionType.blog:
      return "blog";
  }
};

export default function Section({ sectionType }: { sectionType: SectionType }) {
  return (
    <div className="mt-12">
      <HeadlineMedium text={sectionTitle(sectionType)} showAsterisk />

      {work.map((item, index) => (
        <>
          <Card
            key={index}
            title={item.title}
            role={item.role}
            date={item.date}
            description={item.description}
            href={item.href}
          />
        </>
      ))}
    </div>
  );
}
