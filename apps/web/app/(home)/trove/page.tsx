import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrovePreview } from "@/components/trove/trove-preview";
import { listTrove } from "@/lib/trove";
import { TROVE_ENABLED } from "@/lib/trove-config";

const description = "flutter stuff i actually use. copy one file, ship.";

export const metadata: Metadata = {
	alternates: { canonical: "/trove" },
	description,
	openGraph: {
		description,
		images: [
			{
				alt: "stormej — trove",
				height: 630,
				url: "/og/trove",
				width: 1200,
			},
		],
		title: "trove | stormej",
		type: "website",
		url: "https://www.stormej.me/trove",
	},
	title: "trove",
	twitter: {
		description,
		images: ["/og/trove"],
		title: "trove | stormej",
	},
};

export default function Trove() {
	if (!TROVE_ENABLED) {
		notFound();
	}

	const items = listTrove();

	return (
		<main>
			<div className="sticky top-16 z-20 -mx-2 mb-8 bg-background/85 px-2 py-3 backdrop-blur-md">
				<h1 className="section-label">trove</h1>
			</div>
			<p className="mb-8 text-pretty font-light text-[13px] text-muted-foreground leading-[1.6]">
				{description}
			</p>
			<ul className="flex flex-col gap-5">
				{items.map((item) => (
					<li key={item.slug}>
						<TrovePreview demo={item.demo} surface="trove" title={item.title}>
							<Link
								className="group flex flex-col gap-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
								href={item.url}
							>
								<div className="flex min-w-0 flex-col gap-0.5">
									<span className="squiggle-link-hover font-medium text-[14px] text-foreground sm:truncate">
										{item.title}
									</span>
									{(item.description ?? item.subtitle) && (
										<span className="font-light text-[12px] text-muted-foreground leading-snug sm:line-clamp-1">
											{item.description ?? item.subtitle}
										</span>
									)}
								</div>
								<span className="meta-tag shrink-0 whitespace-nowrap tabular-nums">
									{item.sourceFile ?? item.tech.join(" · ")}
								</span>
							</Link>
						</TrovePreview>
					</li>
				))}
			</ul>
		</main>
	);
}
