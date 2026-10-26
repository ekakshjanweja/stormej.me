import type { Metadata } from "next";
import Image from "next/image";
import { GYM_CLIP, LINKS, PERSON, PORTRAITS, WORK } from "@/lib/profile";
import { ExternalLink, NEW_TAB } from "../_components/external-link";
import { Facts } from "../_components/facts";
import { MainButtonLabel } from "../_components/main-button";
import { PageHero } from "../_components/page-hero";
import { Reveal } from "../_components/reveal";
import { SpeakersFull } from "../_components/speakers";
import { StudioLink } from "../_components/studio-link";
import { When } from "../_components/when";
import { ABOUT_STACK, caseHref, hasCase, pad, span } from "../_lib/pages";

export const metadata: Metadata = {
	description: PERSON.subline,
	title: "about",
};

/* who runs the studio: a few photos, the gym clip, the teams, the stack,
   and what's on the speakers */

const PHOTOS = [PORTRAITS.shimla, PORTRAITS.rooftop, PORTRAITS.elevator];

const FACTS = [
	PERSON.location,
	`${WORK.length} startups`,
	`${ABOUT_STACK.length} tools i reach for`,
];

export default function AboutPage() {
	return (
		<>
			<PageHero
				eyebrow="about"
				foot={<Facts items={FACTS} label="in short" />}
				title="the engineer"
			>
				<p>{PERSON.tagline}</p>
				<p>{PERSON.subline}</p>
			</PageHero>
			<Reveal className="about">
				<section aria-label="photos" className="about-photos">
					{PHOTOS.map((photo) => (
						<figure className="about-photo" data-reveal key={photo.src}>
							<Image
								alt={photo.alt}
								height={photo.height}
								sizes="(min-width: 768px) 30vw, 90vw"
								src={photo.src}
								width={photo.width}
							/>
							<figcaption>{photo.place}</figcaption>
						</figure>
					))}
					<figure className="about-photo" data-reveal>
						<video
							aria-label={GYM_CLIP.alt}
							controls
							height={GYM_CLIP.height}
							playsInline
							poster={GYM_CLIP.poster}
							preload="none"
							src={GYM_CLIP.src}
							width={GYM_CLIP.width}
						>
							<track
								default
								kind="captions"
								label="english"
								src={GYM_CLIP.captions}
								srcLang="en"
							/>
						</video>
						<figcaption>{GYM_CLIP.title}</figcaption>
					</figure>
				</section>

				<section aria-labelledby="teams-title" className="about-block">
					<h2 className="about-label" id="teams-title">
						the teams
					</h2>
					<ol className="index-list">
						{WORK.map((job, index) => {
							const body = (
								<>
									<span aria-hidden="true" className="index-row-number">
										{pad(index + 1)}
									</span>
									<span className="index-row-title">{job.company}</span>
									<span className="index-row-detail">{job.role}</span>
									<span className="index-row-when">
										<When value={span(job.start, job.end)} />
									</span>
									<span aria-hidden="true" className="index-row-arrow">
										{hasCase(job.slug) ? "→" : "↗"}
									</span>
								</>
							);
							return (
								<li className="index-row" data-reveal key={job.slug}>
									{hasCase(job.slug) ? (
										<StudioLink
											className="index-row-link"
											href={caseHref(job.slug)}
										>
											{body}
										</StudioLink>
									) : (
										<a
											className="index-row-link"
											href={job.href}
											rel="noopener noreferrer"
											target="_blank"
										>
											{body}
											<span className="sr-only">
												{" "}
												(on stormej.me, {NEW_TAB})
											</span>
										</a>
									)}
								</li>
							);
						})}
					</ol>
				</section>

				<section aria-labelledby="stack-title" className="about-block">
					<h2 className="about-label" id="stack-title">
						what i build with
					</h2>
					<ul className="about-stack">
						{ABOUT_STACK.map((tool) => (
							<li data-reveal key={tool}>
								{tool}
							</li>
						))}
					</ul>
				</section>

				<SpeakersFull />

				<section aria-labelledby="hi-title" className="about-block about-hi">
					<h2 className="about-hi-title" id="hi-title">
						say hi.
					</h2>
					<p>the fastest way is a short email about what you're building.</p>
					<div className="about-hi-links">
						<a className="btn-main" href={`mailto:${PERSON.email}`}>
							<MainButtonLabel>write an email</MainButtonLabel>
						</a>
						<ExternalLink href={LINKS.cal}>or book a call</ExternalLink>
					</div>
				</section>
			</Reveal>
		</>
	);
}
