import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WORK_CASES } from "@/lib/cases";
import {
	GYM_CLIP,
	LINKS,
	PERSON,
	PORTRAITS,
	STACK,
	STATS,
	WORK,
	yearsShipping,
} from "@/lib/profile";
import { Band } from "../_components/band";
import { ClipPlayer } from "../_components/clip-player";
import { NextBand } from "../_components/next-band";
import { OutLink } from "../_components/out-link";
import { RadioBlock } from "../_components/radio";
import { Shell } from "../_components/shell";
import { Line } from "../_components/words";
import { caseHref, PERSONAL, ROUTES } from "../_lib/content";
import { aboutMarkdown } from "../_lib/markdown";
import { span } from "../_lib/stories";

export const metadata: Metadata = {
	description: PERSON.tagline,
	title: "about · ekaksh janweja · orbit",
};

const NUMBERS = [
	{ label: "startups", value: String(STATS.startups) },
	{ label: "projects", value: String(STATS.projects) },
	{ label: "years shipping", value: String(yearsShipping()) },
	{
		label: "contributions in 2025",
		value: STATS.contributions2025.toLocaleString("en-US"),
	},
];

const PHOTOS = [PORTRAITS.shimla, PORTRAITS.rooftop, PORTRAITS.elevator];

export default function AboutPage() {
	const { shimla } = PORTRAITS;
	return (
		<Shell markdown={aboutMarkdown()}>
			<Band
				hang={
					<div aria-hidden="true" className="solo" data-shape="portrait">
						<span
							className="solo-card"
							style={
								{
									"--on": PERSONAL.on,
									"--world": PERSONAL.color,
								} as React.CSSProperties
							}
						>
							<span className="card-frame" />
							<span className="solo-face">
								<Image
									alt=""
									className="solo-media"
									fill
									priority
									sizes="280px"
									src={shimla.src}
								/>
							</span>
						</span>
					</div>
				}
				labelledBy="about-title"
				size="short"
			>
				<h1 className="band-crumb" id="about-title">
					about
				</h1>
				<Line before="i'm ekaksh. i build for" word="people" />
				<p className="band-note">{PERSON.tagline}</p>
			</Band>

			<section aria-labelledby="intro-title" className="about-intro">
				<h2 className="sr-only" id="intro-title">
					in short
				</h2>
				<p className="pull" data-reveal="up">
					{PERSON.subline}
				</p>
				<p className="about-where" data-reveal="up">
					based in {PERSON.location}. mostly mobile and ai.
				</p>
				<dl className="outcome-list about-numbers">
					{NUMBERS.map((number, index) => (
						<div
							data-reveal="up"
							key={number.label}
							style={{ "--i": index } as React.CSSProperties}
						>
							<dt>{number.label}</dt>
							<dd>{number.value}</dd>
						</div>
					))}
				</dl>
			</section>

			<section aria-labelledby="photos-title" className="photos">
				<div className="section-head" data-reveal="up">
					<h2 className="section-title" id="photos-title">
						away from the desk
					</h2>
					<p className="section-note">a few places, and the gym.</p>
				</div>
				<div className="photo-row">
					{PHOTOS.map((photo) => (
						<figure className="photo" data-reveal="up" key={photo.src}>
							<span
								className="photo-frame"
								style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
							>
								<Image
									alt={photo.alt}
									fill
									sizes="(max-width: 700px) 90vw, 30vw"
									src={photo.src}
								/>
							</span>
							<figcaption>{photo.place}</figcaption>
						</figure>
					))}
					<div className="photo" data-reveal="up">
						<ClipPlayer
							captions={GYM_CLIP.captions}
							height={GYM_CLIP.height}
							poster={GYM_CLIP.poster}
							src={GYM_CLIP.src}
							title={GYM_CLIP.title}
							width={GYM_CLIP.width}
						>
							<span>{GYM_CLIP.title}</span>
							<span className="sr-only">{GYM_CLIP.alt}</span>
						</ClipPlayer>
					</div>
				</div>
			</section>

			<section aria-labelledby="timeline-title" className="timeline">
				<div className="section-head" data-reveal="up">
					<h2 className="section-title" id="timeline-title">
						the timeline
					</h2>
					<p className="section-note">newest first.</p>
				</div>
				<ol className="timeline-list">
					{WORK.map((job) => {
						const item = WORK_CASES.find((entry) => entry.slug === job.slug);
						return (
							<li data-reveal="up" key={job.slug}>
								<span className="timeline-when">
									{span(job.start, job.end)}
								</span>
								<span className="timeline-name">
									{item ? (
										<Link data-cursor="open" href={caseHref(item)}>
											{job.company}
										</Link>
									) : (
										job.company
									)}
								</span>
								<span className="timeline-role">{job.role}</span>
							</li>
						);
					})}
				</ol>
			</section>

			<section aria-labelledby="stack-title" className="stack">
				<h2 className="kicker" id="stack-title">
					what i reach for
				</h2>
				<ul className="chips" data-reveal="up">
					{STACK.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
				<p className="about-where" data-reveal="up">
					the long version is <OutLink href={LINKS.resume}>the resume</OutLink>.
				</p>
			</section>

			<RadioBlock />

			<NextBand
				color={PERSONAL.color}
				href={ROUTES.contact}
				kicker="keep walking"
				on={PERSONAL.on}
				sub="book a call, or write."
				title="contact"
			/>
		</Shell>
	);
}
