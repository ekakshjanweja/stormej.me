"use client";

import { useRef } from "react";
import { DELIVERIES, QUOTE } from "../_lib/content";
import { NIGHT_PALETTE } from "../_lib/fluid";
import { caseHref } from "../_lib/pages";
import { ExternalLink } from "./external-link";
import { FluidCanvas } from "./fluid-canvas";
import { ImageTrail } from "./image-trail";
import { Reel } from "./reel-dialog";
import { StudioLink } from "./studio-link";

/* two rows: a playground of screenshots beside a line of his own on a dark
   fluid, then the four latest builds (each opening its case study) beside
   a reel */

export function WorkGrid() {
	const quoteRef = useRef<HTMLParagraphElement>(null);
	const masks = useRef([quoteRef]).current;

	return (
		<section aria-labelledby="work-title" className="work" id="work">
			<h2 className="sr-only" id="work-title">
				recent work
			</h2>
			<div className="work-row">
				<div className="work-trail">
					<ImageTrail />
					<div className="work-trail-copy">
						<h3 className="work-label">see for yourself</h3>
						<p className="work-hint">move across the card</p>
					</div>
				</div>
				<figure className="work-quote">
					<FluidCanvas masks={masks} palette={NIGHT_PALETTE} />
					<blockquote className="work-quote-body">
						<p className="work-quote-text" ref={quoteRef}>
							{QUOTE.text}
						</p>
					</blockquote>
					<figcaption className="work-quote-source">
						ekaksh,{" "}
						<ExternalLink href={QUOTE.href}>{QUOTE.source}</ExternalLink>
					</figcaption>
				</figure>
			</div>

			<div className="work-row">
				<div className="work-delivery">
					<div className="work-delivery-head">
						<h3 className="work-label">latest builds</h3>
						<StudioLink className="work-all" href="/studio/work">
							all the work <span aria-hidden="true">→</span>
						</StudioLink>
					</div>
					<ul className="delivery-list">
						{DELIVERIES.map((project) => (
							<li className="delivery" key={project.slug}>
								<p className="delivery-title">{project.title}</p>
								<p className="delivery-text">{project.summary}</p>
								<ul aria-label="details" className="delivery-pills">
									<li>{project.year}</li>
									<li>{project.stack.slice(0, 2).join(" · ")}</li>
								</ul>
								<StudioLink
									aria-label={`${project.title}, the case study`}
									className="delivery-link"
									href={caseHref(project.slug)}
								>
									case study →
								</StudioLink>
							</li>
						))}
					</ul>
				</div>
				<div className="work-reel">
					<Reel />
				</div>
			</div>
		</section>
	);
}
