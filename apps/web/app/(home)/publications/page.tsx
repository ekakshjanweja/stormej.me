import type { Metadata } from "next";
import { listPublications } from "@/lib/publication";
import { PublicationsList } from "./publications-list";

const description = "papers, preprints, and research write-ups";

export const metadata: Metadata = {
	alternates: { canonical: "/publications" },
	description,
	openGraph: {
		description,
		title: "publications | stormej",
		type: "website",
		url: "https://www.stormej.me/publications",
	},
	title: "publications",
	twitter: {
		description,
		title: "publications | stormej",
	},
};

export default function Publications() {
	const publications = listPublications();

	return (
		<main>
			<h1 className="sr-only">publications</h1>
			<PublicationsList publications={publications} />
		</main>
	);
}
