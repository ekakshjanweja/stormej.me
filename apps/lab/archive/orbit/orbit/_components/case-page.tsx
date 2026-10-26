import Link from "next/link";
import type { Case } from "@/lib/cases";
import { PROJECTS } from "@/lib/profile";
import { type Card, caseHref, WORLDS, type WorldId } from "../_lib/content";
import { bareUrl, pad } from "../_lib/format";
import { Arc } from "./arc";
import { Band } from "./band";
import { Chapters } from "./chapters";
import { Gallery } from "./gallery";
import { LoopVideo } from "./loop-video";
import { NextBand } from "./next-band";
import { OutLink } from "./out-link";
import { Words, wordCount } from "./words";

/* one job or project, long form: its sky, the problem in a line, what came
   of it, the screens, the story in chapters, and the way on */

interface CasePageProps {
	item: Case;
	next: Case | undefined;
	/** 1-based place in its list */
	position: number;
	total: number;
}

const HERO_SHOTS = 3;

/** what hangs in the case's sky: its clip, a few screens, or its name in type */
function CaseHang({ item, world }: { item: Case; world: WorldId }) {
	const project = PROJECTS.find((entry) => entry.slug === item.slug);
	if (project?.video && project.image) {
		return (
			<div
				aria-hidden="true"
				className="solo"
				data-shape={project.orientation ?? "portrait"}
			>
				<span className="solo-card">
					<span className="card-frame" />
					<span className="solo-face">
						<LoopVideo
							className="solo-media"
							poster={project.image}
							src={project.video}
						/>
					</span>
				</span>
			</div>
		);
	}
	const cards: Card[] =
		item.gallery.length > 0
			? item.gallery.slice(0, HERO_SHOTS).map((image, index) => ({
					href: "#screens",
					id: image,
					image,
					kind: "shot",
					tag: `screen ${index + 1}`,
					title: item.title,
					world,
				}))
			: [
					{
						href: "#story",
						id: item.slug,
						kicker: item.role,
						kind: "type",
						tag: item.when,
						title: item.subtitle,
						world,
					},
				];
	return <Arc cards={cards} decorative label={`${item.title}, at a glance`} />;
}

export function CasePage({ item, next, position, total }: CasePageProps) {
	const worldId: WorldId = item.kind === "work" ? "work" : "build";
	const world = WORLDS[worldId];
	const titleWords = wordCount(item.title);

	return (
		<div
			className="case"
			style={
				{ "--on": world.on, "--world": world.color } as React.CSSProperties
			}
		>
			<Band
				hang={<CaseHang item={item} world={worldId} />}
				labelledBy="case-title"
				size="case"
				world={worldId}
			>
				<p className="band-crumb">
					<Link href={world.href}>{world.label}</Link>
					<span aria-hidden="true"> / </span>
					<span>
						{pad(position)} of {pad(total)}
					</span>
				</p>
				<h1 className="case-title" id="case-title">
					<Words text={item.title} />
				</h1>
				<p className="case-subtitle">
					<Words start={titleWords} text={item.subtitle} />
				</p>
				<dl className="case-meta">
					<div>
						<dt>role</dt>
						<dd>{item.role}</dd>
					</div>
					<div>
						<dt>when</dt>
						<dd>{item.when}</dd>
					</div>
					<div>
						<dt>made with</dt>
						<dd>{item.tech.join(" · ")}</dd>
					</div>
				</dl>
			</Band>

			<section aria-labelledby="challenge-title" className="case-intro">
				<div className="case-challenge" data-reveal="up">
					<h2 className="kicker" id="challenge-title">
						the challenge
					</h2>
					<p className="pull">{item.challenge}</p>
				</div>
				<div className="case-tldr" data-reveal="up">
					<h2 className="kicker">tl;dr</h2>
					<ul className="dash-list">
						{item.tldr.map((point) => (
							<li key={point}>{point}</li>
						))}
					</ul>
				</div>
			</section>

			<section aria-labelledby="outcomes-title" className="outcomes">
				<h2 className="kicker" id="outcomes-title">
					what came of it
				</h2>
				<dl className="outcome-list">
					{item.outcomes.map((outcome, index) => (
						<div
							data-reveal="up"
							key={outcome.label}
							style={{ "--i": index } as React.CSSProperties}
						>
							<dt>{outcome.label}</dt>
							<dd>{outcome.metric}</dd>
						</div>
					))}
				</dl>
			</section>

			{item.gallery.length > 0 ? (
				<section
					aria-labelledby="screens-title"
					className="case-screens"
					id="screens"
				>
					<div className="section-head" data-reveal="up">
						<h2 className="section-title" id="screens-title">
							the screens
						</h2>
						<p className="section-note">
							{item.galleryShape === "phone"
								? "straight off the phone."
								: "straight off the screen."}
						</p>
					</div>
					<Gallery
						shape={item.galleryShape}
						shots={item.gallery}
						title={item.title}
					/>
				</section>
			) : null}

			<section aria-label="the story" className="case-story" id="story">
				<Chapters chapters={item.chapters} />
			</section>

			<section aria-labelledby="links-title" className="case-links">
				<h2 className="kicker" id="links-title">
					elsewhere
				</h2>
				<ul className="out-list">
					{item.links.map((link) => (
						<li key={link.href}>
							<OutLink className="out-row" cursor="visit" href={link.href}>
								<span className="out-label">{link.label}</span>
								<span className="out-url">{bareUrl(link.href)}</span>
								<i aria-hidden="true">↗</i>
							</OutLink>
						</li>
					))}
					<li>
						<OutLink className="out-row" cursor="read" href={item.source}>
							<span className="out-label">the full write-up</span>
							<span className="out-url">{bareUrl(item.source)}</span>
							<i aria-hidden="true">↗</i>
						</OutLink>
					</li>
				</ul>
			</section>

			{next ? (
				<NextBand
					color={world.color}
					href={caseHref(next)}
					kicker={`next case · ${pad((position % total) + 1)} of ${pad(total)}`}
					on={world.on}
					sub={next.subtitle}
					title={next.title}
				/>
			) : null}
		</div>
	);
}
