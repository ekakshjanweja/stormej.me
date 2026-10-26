import type { Metadata } from "next";
import { INSTAGRAM } from "@/lib/profile";
import { ExternalLink, NEW_TAB } from "../_components/external-link";
import { Facts } from "../_components/facts";
import { PageHero } from "../_components/page-hero";
import { ReelGrid } from "../_components/reel-grid";
import { Reveal } from "../_components/reveal";
import { dayMonth, POSTS_BY_YEAR, pad, WRITING_PAGE } from "../_lib/pages";

export const metadata: Metadata = {
	description: WRITING_PAGE.text,
	title: "notes",
};

/* the posts on stormej.me, grouped by year and numbered across the
   years, then the instagram reels */
const STARTS = POSTS_BY_YEAR.map((_, index) =>
	POSTS_BY_YEAR.slice(0, index).reduce(
		(sum, group) => sum + group.posts.length,
		0
	)
);

export default function WritingPage() {
	return (
		<>
			<PageHero
				eyebrow="notes"
				foot={<Facts items={WRITING_PAGE.facts} label="in numbers" />}
				title={WRITING_PAGE.title}
			>
				<p>{WRITING_PAGE.text}</p>
			</PageHero>
			<Reveal className="index-section">
				{POSTS_BY_YEAR.map((group, groupIndex) => (
					<section
						aria-labelledby={`year-${group.year}`}
						className="index-group"
						key={group.year}
					>
						<div className="index-group-head">
							<h2 className="index-group-title" id={`year-${group.year}`}>
								{group.year}
							</h2>
							<p className="index-group-text">
								{group.posts.length === 1
									? "one post."
									: `${group.posts.length} posts.`}
							</p>
						</div>
						<ol className="index-list">
							{group.posts.map((post, index) => (
								<li className="index-row" data-reveal key={post.href}>
									<a
										className="index-row-link"
										href={post.href}
										rel="noopener noreferrer"
										target="_blank"
									>
										<span aria-hidden="true" className="index-row-number">
											{pad((STARTS[groupIndex] ?? 0) + index + 1)}
										</span>
										<span className="index-row-title">{post.title}</span>
										<span className="index-row-detail">{post.summary}</span>
										<span className="index-row-when">
											{dayMonth(post.date)}
										</span>
										<span aria-hidden="true" className="index-row-arrow">
											{"↗"}
										</span>
										<span className="sr-only"> (on stormej.me, {NEW_TAB})</span>
									</a>
								</li>
							))}
						</ol>
					</section>
				))}
				<section aria-labelledby="reels-title" className="index-group">
					<div className="index-group-head">
						<h2 className="index-group-title" id="reels-title">
							short-form
						</h2>
						<p className="index-group-text">
							the desk, the walks and the builds.{" "}
							<ExternalLink href={INSTAGRAM}>@stormej.studio</ExternalLink>
						</p>
					</div>
					<ReelGrid />
				</section>
			</Reveal>
		</>
	);
}
