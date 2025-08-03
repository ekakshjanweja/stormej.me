import { BlogRow } from "./_components/blog-row";
import Hero from "./_components/hero";
import { Projects } from "./_components/projects";
import Work from "./_components/work";

export default async function Home() {
  return (
    <div>
      <Hero />
      <Work />
      <Projects />
      <BlogRow />
    </div>
  );
}
