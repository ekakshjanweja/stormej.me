import { BlogRow } from "./_components/blog-row";
import Hero from "./_components/hero";
import Section, { SectionType } from "@/components/section";

export default async function Home() {
  return (
    <div>
      <Hero />

      <Section sectionType={SectionType.work} />
      <Section sectionType={SectionType.project} />
      <BlogRow />
    </div>
  );
}
