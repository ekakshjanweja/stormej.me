import Card from "@/components/card";
import { SectionType } from "@/components/section";
import HeadlineLarge from "@/components/styles/headline-large";
import { projects } from "@/lib/constants/projects";

export default function Project() {
  return (
    <>
      <div>
        <HeadlineLarge text="projects" showAsterisk />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          {projects.map((item, index) => (
            <>
              <div key={index} className="mt-8">
                <Card
                  title={item.title}
                  role={item.role}
                  date={item.date}
                  description={item.description}
                  href={item.href}
                  sectionType={SectionType.project}
                  tech={item.tech}
                />
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
}
