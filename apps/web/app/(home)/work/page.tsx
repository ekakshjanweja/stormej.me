import type { Metadata } from "next";
import Link from "next/link";
import { LogoTile } from "@/components/logo-tile";
import { WorkPreview } from "@/components/work-preview";
import {
	formatTotalExperienceAriaLabel,
	formatTotalExperienceShort,
	listWork,
} from "@/lib/work";

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

function formatRange(start: Date, end?: Date | null) {
	const fmt = (d: Date) =>
		d
			.toLocaleString("default", { month: "short", year: "numeric" })
			.toLowerCase();
	return `${fmt(start)} to ${end ? fmt(end) : "present"}`;
}

export default function Work() {
	const work = listWork();
	const totalExp = formatTotalExperienceShort(work);
	const totalExpAria = formatTotalExperienceAriaLabel(work);
	return (
		<main>
			<div className="sticky top-16 z-20 -mx-2 mb-8 bg-background/85 px-2 py-3 backdrop-blur-md">
				<h1 className="section-label inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5">
					<span>work</span>
					{totalExp ? (
						<span
							aria-label={totalExpAria}
							className="meta-tag normal-case tracking-[0.06em]"
							role="note"
						>
							({totalExp})
						</span>
					) : null}
				</h1>
			</div>
			<ul className="flex flex-col gap-6">
				{work.map((item) => (
					<li key={item.slug}>
						<WorkPreview
							href={`/work/${item.slug}`}
							images={item.images}
							logo={item.logo}
							screenshotMockup={item.screenshotMockup}
							title={item.title}
						>
							<Link
								className="group flex flex-col gap-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
								href={`/work/${item.slug}`}
							>
								<div className="flex items-center justify-between gap-3 sm:gap-4">
									<div className="flex min-w-0 flex-1 items-center gap-3">
										{item.logo && (
											<LogoTile
												boxClassName="h-7 w-7"
												imagePadClassName="p-1"
												src={item.logo}
											/>
										)}
										<div className="flex min-w-0 flex-1 flex-col gap-0.5">
											<span className="squiggle-link-hover truncate font-medium text-[14px] text-foreground">
												{item.title}
											</span>
											<span className="font-light text-[12px] text-muted-foreground leading-tight">
												{item.role}
											</span>
											<span className="meta-tag mt-0.5 whitespace-nowrap sm:hidden">
												{formatRange(item.startDate, item.endDate)}
											</span>
										</div>
									</div>
									<span className="meta-tag hidden shrink-0 whitespace-nowrap sm:inline">
										{formatRange(item.startDate, item.endDate)}
									</span>
								</div>
								{item.description && (
									<p className="pl-10 font-light text-[13px] text-muted-foreground leading-[1.55]">
										{item.description}
									</p>
								)}
							</Link>
						</WorkPreview>
					</li>
				))}
			</ul>
		</main>
	);
}
