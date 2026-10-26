import type { Metadata } from "next";
import { PROJECT_CASES } from "@/lib/cases";
import { PROJECTS } from "@/lib/profile";
import { Arc } from "../_components/arc";
import { Band } from "../_components/band";
import { NextBand } from "../_components/next-band";
import { OutLink } from "../_components/out-link";
import { Shell } from "../_components/shell";
import { Story } from "../_components/story";
import { Line } from "../_components/words";
import { CARDS, WORLDS } from "../_lib/content";
import { bareUrl } from "../_lib/format";
import { buildMarkdown } from "../_lib/markdown";
import { projectStory } from "../_lib/stories";

export const metadata: Metadata = {
	description: "side projects for fun: small tools i wanted to exist.",
	title: "build · ekaksh janweja · orbit",
};

const world = WORLDS.build;
const HUNG = 3;

const ARCHIVE = PROJECTS.filter(
	(project) => !PROJECT_CASES.some((item) => item.slug === project.slug)
);

export default function BuildPage() {
	const stories = PROJECT_CASES.map((item) =>
		projectStory(
			item,
			PROJECTS.find((project) => project.slug === item.slug)
		)
	);
	return (
		<Shell markdown={buildMarkdown()}>
			<Band
				hang={
					<Arc
						cards={CARDS.filter((card) => card.world === "build").slice(
							0,
							HUNG
						)}
						decorative
						label="some of the builds"
					/>
				}
				labelledBy="build-title"
				world="build"
			>
				<h1 className="band-crumb" id="build-title">
					{world.title}
				</h1>
				<Line before={world.line.before} word={world.line.word} />
				<p className="band-note">
					{PROJECTS.length} projects. most of them still run.
				</p>
			</Band>

			<section aria-labelledby="featured-title" className="stories">
				<div className="section-head" data-reveal="up">
					<h2 className="section-title" id="featured-title">
						the ones with a story
					</h2>
					<p className="section-note">each one opens into its full case.</p>
				</div>
				<div className="story-list">
					{stories.map((story, index) => (
						<Story
							href={story.href}
							index={index}
							key={story.slug}
							media={story.media}
							points={story.points}
							role={story.role}
							summary={story.summary}
							tech={story.tech}
							title={story.title}
							when={story.when}
							world="build"
						/>
					))}
				</div>
			</section>

			<section aria-labelledby="archive-title" className="archive">
				<div className="section-head" data-reveal="up">
					<h2 className="section-title" id="archive-title">
						the archive
					</h2>
					<p className="section-note">older, smaller, or retired.</p>
				</div>
				<ul className="out-list">
					{ARCHIVE.map((project) => (
						<li data-reveal="up" key={project.slug}>
							<OutLink className="out-row" cursor="visit" href={project.href}>
								<span className="out-label">{project.title}</span>
								<span className="out-summary">{project.summary}</span>
								<span className="out-url">
									{project.year} · {bareUrl(project.href)}
								</span>
								<i aria-hidden="true">↗</i>
							</OutLink>
						</li>
					))}
				</ul>
			</section>

			<NextBand
				color={WORLDS.write.color}
				href={WORLDS.write.href}
				kicker="keep walking"
				on={WORLDS.write.on}
				sub="notes for developers, and reels from the desk."
				title={WORLDS.write.title}
			/>
		</Shell>
	);
}
