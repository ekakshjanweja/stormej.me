import type { Metadata } from "next";
import { buildProfilePageSchema, jsonLd, SITE_TAGLINE } from "@/lib/schema";
import { BlogRow } from "./_components/blog-row";
import { Contributions } from "./_components/contributions";
import Hero from "./_components/hero";
import { PublicationsRow } from "./_components/publications-row";
import Stack from "./_components/stack";
import { TroveRow } from "./_components/trove-row";
// import { Projects } from "./_components/projects";
import Work from "./_components/work";

export const metadata: Metadata = {
	alternates: { canonical: "/" },
	openGraph: {
		images: [
			{
				alt: `ekaksh janweja — ${SITE_TAGLINE}`,
				height: 630,
				url: "/og/home",
				width: 1200,
			},
		],
		url: "https://www.stormej.me",
	},
	twitter: {
		images: ["/og/home"],
	},
};

export default async function Home() {
	return (
		<>
			<script
				dangerouslySetInnerHTML={{ __html: jsonLd(buildProfilePageSchema()) }}
				type="application/ld+json"
			/>
			<div className="space-y-16">
				<Hero />
				<Work />
				{/* <Projects /> */}
				<PublicationsRow />
				<BlogRow />
				<TroveRow />
				<Contributions />
				<Stack />
			</div>
		</>
	);
}
