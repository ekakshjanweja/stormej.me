"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import { listBlogs } from "@/lib/blog";

export const BlogRow = () => {
	const blogs = listBlogs();

	return (
		<section data-cursor-anchor="blog">
			<div className="mb-6 flex items-baseline justify-between">
				<h2 className="section-label">writing</h2>
				{blogs.length > 2 && (
					<Link
						className="meta-tag hover-dim rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
						href="/blog"
					>
						view all
					</Link>
				)}
			</div>
			<ul className="flex flex-col gap-4">
				{blogs.slice(0, 2).map((blog) => (
					<li key={blog.slug}>
						<Link
							className="group flex flex-col gap-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
							href={blog.url}
							onClick={() =>
								track("content_card_clicked", {
									kind: "blog",
									slug: blog.slug,
									title: blog.title,
								})
							}
						>
							<span className="squiggle-link-hover font-medium text-[14px] text-foreground sm:truncate">
								{blog.title}
							</span>
							<span className="meta-tag shrink-0 whitespace-nowrap">
								{blog.formattedDate}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
};
