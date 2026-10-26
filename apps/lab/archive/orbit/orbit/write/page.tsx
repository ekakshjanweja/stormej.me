import type { Metadata } from "next";
import Image from "next/image";
import { LINKS, REELS, WRITING } from "@/lib/profile";
import { Arc } from "../_components/arc";
import { Band } from "../_components/band";
import { ClipPlayer } from "../_components/clip-player";
import { NextBand } from "../_components/next-band";
import { OutLink } from "../_components/out-link";
import { Shell } from "../_components/shell";
import { Line } from "../_components/words";
import { CARDS, PERSONAL, ROUTES, WORLDS } from "../_lib/content";
import { dayMonthYear, pad } from "../_lib/format";
import { writeMarkdown } from "../_lib/markdown";

export const metadata: Metadata = {
	description: "write-ups for developers, and short reels from the desk.",
	title: "write · ekaksh janweja · orbit",
};

const world = WORLDS.write;
const HUNG = 3;
/* reels are saved 540px wide at 9:16 */
const REEL_W = 540;
const REEL_H = 960;

export default function WritePage() {
	return (
		<Shell markdown={writeMarkdown()}>
			<Band
				hang={
					<Arc
						cards={CARDS.filter((card) => card.world === "write").slice(
							0,
							HUNG
						)}
						decorative
						label="some of the notes"
					/>
				}
				labelledBy="write-title"
				world="write"
			>
				<h1 className="band-crumb" id="write-title">
					{world.title}
				</h1>
				<Line before={world.line.before} word={world.line.word} />
				<p className="band-note">
					{WRITING.length} notes. {REELS.length} reels.
				</p>
			</Band>

			<section aria-labelledby="notes-title" className="notes">
				<div className="section-head" data-reveal="up">
					<h2 className="section-title" id="notes-title">
						notes
					</h2>
					<p className="section-note">they open on stormej.me.</p>
				</div>
				<ol className="note-list">
					{WRITING.map((post, index) => (
						<li data-reveal="up" key={post.href}>
							<OutLink className="note" cursor="read" href={post.href}>
								<span className="note-n">{pad(index + 1)}</span>
								<span className="note-text">
									<span className="note-title">{post.title}</span>
									<span className="note-summary">{post.summary}</span>
								</span>
								<time className="note-date" dateTime={post.date}>
									{dayMonthYear(post.date)}
								</time>
							</OutLink>
						</li>
					))}
				</ol>
			</section>

			<section aria-labelledby="reels-title" className="reels">
				<div className="section-head" data-reveal="up">
					<h2 className="section-title" id="reels-title">
						reels, from the desk
					</h2>
					<p className="section-note">
						as <OutLink href={LINKS.instagram}>stormej.studio</OutLink> on
						instagram. press one for sound.
					</p>
				</div>
				<ul className="reel-grid">
					{REELS.map((reel) => (
						<li data-reveal="up" key={reel.href}>
							{reel.video ? (
								<ClipPlayer
									captions={reel.captions}
									height={REEL_H}
									poster={reel.cover}
									src={reel.video}
									title={reel.title}
									width={REEL_W}
								>
									<OutLink className="reel-link" href={reel.href}>
										{reel.title}
									</OutLink>
									<time dateTime={reel.date}>{dayMonthYear(reel.date)}</time>
								</ClipPlayer>
							) : (
								<OutLink className="reel-cover" cursor="open" href={reel.href}>
									<span className="reel-cover-media">
										<Image
											alt=""
											fill
											sizes="(max-width: 700px) 45vw, 260px"
											src={reel.cover}
										/>
									</span>
									<span className="reel-link">{reel.title}</span>
									<time dateTime={reel.date}>{dayMonthYear(reel.date)}</time>
								</OutLink>
							)}
						</li>
					))}
				</ul>
			</section>

			<NextBand
				color={PERSONAL.color}
				href={ROUTES.about}
				kicker="keep walking"
				on={PERSONAL.on}
				sub="who's behind all of it."
				title="about"
			/>
		</Shell>
	);
}
