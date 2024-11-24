import Hero from "./_components/header";
import Section, { SectionType } from "@/components/section";

export default function Home() {
  return (
    <div>
      <Hero />

      <Section sectionType={SectionType.work} />
      <Section sectionType={SectionType.project} />
      <Section sectionType={SectionType.blog} />
    </div>
  );
}
