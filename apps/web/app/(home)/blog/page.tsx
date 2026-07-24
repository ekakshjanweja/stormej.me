import type { Metadata } from "next";
import Link from "next/link";
import { listBlogs } from "@/lib/blog";

const description = "writing on mobile development, side projects, and life";

export const metadata: Metadata = {
	alternates: { canonical: "/blog" },
	description,
	openGraph: {
		description,
		images: [
			{
				alt: "stormej — blog",
				height: 630,
				url: "/og/blog",
				width: 1200,
			},
		],
		title: "blog | stormej",
		type: "website",
		url: "https://www.stormej.me/blog",
	},
	title: "blog",
	twitter: {
		description,
		images: ["/og/blog"],
		title: "blog | stormej",
	},
};

export default function Blog() {
	const blogs = listBlogs();

	return (
		<main>
			<div className="sticky top-16 z-20 -mx-2 mb-8 bg-background/85 px-2 py-3 backdrop-blur-md">
				<h1 className="section-label">writing</h1>
			</div>
			<ul className="flex flex-col gap-5">
				{blogs.map((blog) => (
					<li key={blog.slug}>
						<Link
							className="group flex flex-col gap-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
							href={blog.url}
						>
							<div className="flex min-w-0 flex-col gap-0.5">
								<span className="squiggle-link-hover font-medium text-[14px] text-foreground sm:truncate">
									{blog.title}
								</span>
								{blog.description && (
									<span className="font-light text-[12px] text-muted-foreground leading-snug sm:line-clamp-1">
										{blog.description}
									</span>
								)}
							</div>
							<span className="meta-tag shrink-0 whitespace-nowrap">
								{blog.formattedDate}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
}
