import type { Metadata } from "next";
import { listPublications } from "@/lib/publication";
import { PublicationsList } from "./publications-list";

const description =
  "papers, preprints, and research write-ups";

export const metadata: Metadata = {
  title: "publications",
  description,
  alternates: { canonical: "/publications" },
  openGraph: {
    title: "publications | stormej",
    description,
    url: "https://www.stormej.me/publications",
    type: "website",
  },
  twitter: {
    title: "publications | stormej",
    description,
  },
};

export default function Publications() {
  const publications = listPublications();

  return (
    <main>
      <div className="sticky top-16 z-20 -mx-2 mb-8 bg-background/85 px-2 py-3 backdrop-blur-md">
        <h1 className="section-label">publications</h1>
      </div>
      <PublicationsList publications={publications} />
    </main>
  );
}
