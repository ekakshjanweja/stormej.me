import Image from "next/image";
import Link from "next/link";
import { WORLDS, type WorldId } from "../_lib/content";
import { pad } from "../_lib/format";
import { LoopVideo } from "./loop-video";

/* one job or project on a world's page: what, when, a few lines, and a
   glimpse of it. on wide screens the cards stack as you scroll past */

export type StoryMedia =
	| { kind: "phones"; shots: string[]; video?: { poster: string; src: string } }
	| { kind: "clip"; poster: string; video: string }
	| { kind: "type"; kicker: string; line: string };

interface StoryProps {
	href: string;
	index: number;
	media: StoryMedia;
	points: string[];
	role: string;
	summary: string;
	tech: string[];
	title: string;
	when: string;
	world: WorldId;
}

const PHONES = 3;

function Visual({ media, title }: { media: StoryMedia; title: string }) {
	if (media.kind === "type") {
		return (
			<div className="story-type">
				<span className="story-type-kicker">{media.kicker}</span>
				<span className="story-type-line">{media.line}</span>
			</div>
		);
	}
	if (media.kind === "clip") {
		return (
			<div className="story-clip">
				<span className="story-clip-screen">
					<LoopVideo
						className="story-clip-media"
						poster={media.poster}
						src={media.video}
					/>
				</span>
			</div>
		);
	}
	const shots = media.shots.slice(0, media.video ? PHONES - 1 : PHONES);
	const phones = shots.map((src, index) => ({ index, src }));
	/* the clip, if there is one, goes in the middle */
	const middle = Math.floor((phones.length + (media.video ? 1 : 0)) / 2);
	return (
		<div
			className="story-phones"
			data-count={phones.length + (media.video ? 1 : 0)}
		>
			{phones.map(({ index, src }) => {
				const place = media.video && index >= middle ? index + 1 : index;
				return (
					<span className="phone" data-place={place} key={src}>
						<Image
							alt={`${title} screen ${index + 1}`}
							className="phone-media"
							fill
							sizes="220px"
							src={src}
						/>
					</span>
				);
			})}
			{media.video ? (
				<span className="phone" data-place={middle}>
					<LoopVideo
						className="phone-media"
						poster={media.video.poster}
						src={media.video.src}
					/>
				</span>
			) : null}
		</div>
	);
}

export function Story({
	href,
	index,
	media,
	points,
	role,
	summary,
	tech,
	title,
	when,
	world,
}: StoryProps) {
	const tone = WORLDS[world];
	return (
		<article
			className="story"
			data-reveal="up"
			style={
				{
					"--i": index,
					"--on": tone.on,
					"--world": tone.color,
				} as React.CSSProperties
			}
		>
			<div className="story-text">
				<p className="story-meta">
					<span className="story-n">{pad(index + 1)}</span>
					<span>{when}</span>
					<span>{role}</span>
				</p>
				<h3 className="story-title">
					<Link className="story-link" data-cursor="open" href={href}>
						<span className="story-mark">{title}</span>
					</Link>
				</h3>
				<p className="story-summary">{summary}</p>
				{points.length > 0 ? (
					<ul className="story-points">
						{points.map((point) => (
							<li key={point}>{point}</li>
						))}
					</ul>
				) : null}
				<ul aria-label="made with" className="chips">
					{tech.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
				<p aria-hidden="true" className="story-more">
					read the case <i>→</i>
				</p>
			</div>
			<div className="story-media" data-kind={media.kind}>
				<Visual media={media} title={title} />
			</div>
		</article>
	);
}
