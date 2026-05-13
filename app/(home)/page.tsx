import type { Metadata } from "next";
import { BlogRow } from "./_components/blog-row";
import Hero from "./_components/hero";
// import { Projects } from "./_components/projects";
import Work from "./_components/work";
import Stack from "./_components/stack";
import { Contributions } from "./_components/contributions";
import {
  buildProfilePageSchema,
  jsonLd,
  SITE_TAGLINE,
} from "@/lib/schema";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    url: "https://www.stormej.me",
    images: [
      {
        url: "/og/home",
        width: 1200,
        height: 630,
        alt: `ekaksh janweja — ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    images: ["/og/home"],
  },
};

export default async function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(buildProfilePageSchema()) }}
      />
      <div className="space-y-16">
        <Hero />
        <Work />
        {/* <Projects /> */}
        <BlogRow />
        <Contributions />
        <Stack />
      </div>
    </>
  );
}
