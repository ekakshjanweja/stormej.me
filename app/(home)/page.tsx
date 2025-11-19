import { BlogRow } from "./_components/blog-row";
import Hero from "./_components/hero";
import { Projects } from "./_components/projects";
import Work from "./_components/work";
import Stack from "./_components/stack";
import { Contributions } from "./_components/contributions";

export default async function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "ekaksh janweja",
    alternateName: "stormej",
    jobTitle: "Software Engineer",
    description:
      "Mobile developer building apps at startups. Based in New Delhi, India.",
    url: "https://www.stormej.me",
    sameAs: [
      "https://twitter.com/ekaksh_janweja",
      "https://github.com/ekakshjanweja",
      "https://linkedin.com/in/ekakshjanweja",
    ],
    email: "jekaksh@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "New Delhi",
      addressCountry: "IN",
    },
    knowsAbout: [
      "Mobile Development",
      "Flutter",
      "React Native",
      "Software Engineering",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="space-y-12">
        <Hero />
        <Work />
        <Contributions />
        <Stack />
        <Projects />
        <BlogRow />
      </div>
    </>
  );
}
