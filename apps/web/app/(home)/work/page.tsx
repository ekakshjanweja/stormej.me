import type { Metadata } from "next";
import { listWork } from "@/lib/work";
import { WorkCard } from "../_components/work";

const description = "roles, case studies, and the apps i've built at startups";

export const metadata: Metadata = {
	alternates: { canonical: "/work" },
	description,
	openGraph: {
		description,
		images: [
			{
				alt: "stormej — work",
				height: 630,
				url: "/og/work",
				width: 1200,
			},
		],
		title: "work | stormej",
		type: "website",
		url: "https://www.stormej.me/work",
	},
	title: "work",
	twitter: {
		description,
		images: ["/og/work"],
		title: "work | stormej",
	},
};

export default function Work() {
	const work = listWork();
	return (
		<main>
			<h1 className="sr-only">work</h1>
			<ul className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
				{work.map((item) => (
					<WorkCard item={item} key={item.slug} />
				))}
			</ul>
		</main>
	);
}
