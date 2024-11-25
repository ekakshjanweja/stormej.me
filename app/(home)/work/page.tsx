import Card from "@/components/card";
import { SectionType } from "@/components/section";
import HeadlineLarge from "@/components/styles/headline-large";
import { work } from "@/lib/constants/work";

export default function Work() {
  return (
    <>
      <div>
        <HeadlineLarge text="work" showAsterisk />

        <div className="grid grid-cols-1 gap-x-2">
          {work.map((item, index) => (
            <>
              <div key={index}>
                <Card
                  title={item.title}
                  role={item.role}
                  date={item.date}
                  description={item.description}
                  href={item.href}
                  sectionType={SectionType.work}
                />
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
}
