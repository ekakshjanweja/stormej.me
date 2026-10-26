import type { Metadata } from "next";
import { PERSON, STATS, WORK, yearsShipping } from "@/lib/profile";
import { Arc } from "../_components/arc";
import { Band } from "../_components/band";
import { NextBand } from "../_components/next-band";
import { Shell } from "../_components/shell";
import { Story } from "../_components/story";
import { Line } from "../_components/words";
import { CARDS, WORLDS } from "../_lib/content";
import { workMarkdown } from "../_lib/markdown";
import { jobStory } from "../_lib/stories";

export const metadata: Metadata = {
	description: `${STATS.startups} startups, from idea to production.`,
	title: "work · ekaksh janweja · orbit",
};

const world = WORLDS.work;
const HUNG = 3;

export default function WorkPage() {
	const stories = WORK.map(jobStory);
	return (
		<Shell markdown={workMarkdown()}>
			<Band
				hang={
					<Arc
						cards={CARDS.filter((card) => card.world === "work").slice(0, HUNG)}
						decorative
						label="some of the work"
					/>
				}
				labelledBy="work-title"
				world="work"
			>
				<h1 className="band-crumb" id="work-title">
					{world.title}
				</h1>
				<Line before={world.line.before} word={world.line.word} />
				<p className="band-note">
					{STATS.startups} startups. {yearsShipping()} years shipping.
				</p>
			</Band>

			<section aria-labelledby="stories-title" className="stories">
				<div className="section-head" data-reveal="up">
					<h2 className="section-title" id="stories-title">
						where i've worked
					</h2>
					<p className="section-note">{PERSON.subline}</p>
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
							world="work"
						/>
					))}
				</div>
			</section>

			<NextBand
				color={WORLDS.build.color}
				href={WORLDS.build.href}
				kicker="keep walking"
				on={WORLDS.build.on}
				sub="small tools i wanted to exist."
				title={WORLDS.build.title}
			/>
		</Shell>
	);
}
