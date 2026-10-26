import type { Case } from "@/lib/cases";
import { pad } from "../_lib/pages";
import { ExternalLink, NEW_TAB } from "./external-link";
import { Reveal } from "./reveal";
import { When } from "./when";

/* the plain parts of a case study: the facts under the title, the
   challenge, the numbers, and where to read more */

const hostOf = (href: string) => {
	try {
		return new URL(href).host.replace("www.", "");
	} catch {
		return href;
	}
};

/** role, when, what it's built with, and its links, as a labelled list */
export function CaseFacts({ item }: { item: Case }) {
	return (
		<dl className="case-facts">
			<div>
				<dt>role</dt>
				<dd>{item.role}</dd>
			</div>
			<div>
				<dt>when</dt>
				<dd>
					<When value={item.when} />
				</dd>
			</div>
			<div>
				<dt>built with</dt>
				<dd>{item.tech.join(", ")}</dd>
			</div>
			<div className="case-facts-links">
				<dt>links</dt>
				<dd>
					<ul>
						{item.links.map((link) => (
							<li key={link.href}>
								<ExternalLink href={link.href}>
									{link.label}
									<span aria-hidden="true"> ↗</span>
								</ExternalLink>
							</li>
						))}
					</ul>
				</dd>
			</div>
		</dl>
	);
}

export function CaseIntro({ item }: { item: Case }) {
	/* without screens the short version gets its own big stack further down */
	const showTldr = item.gallery.length > 0;
	return (
		<section aria-labelledby="challenge-title" className="case-intro">
			<h2 className="case-label" id="challenge-title">
				the challenge
			</h2>
			<div className="case-intro-body">
				<p className="case-challenge">{item.challenge}</p>
				{showTldr ? (
					<div className="case-tldr">
						<h3 className="case-label">the short version</h3>
						<ol>
							{item.tldr.map((line, index) => (
								<li key={line}>
									<span aria-hidden="true">{pad(index + 1)}</span>
									{line}
								</li>
							))}
						</ol>
					</div>
				) : null}
			</div>
		</section>
	);
}

export function CaseOutcomes({ item }: { item: Case }) {
	return (
		<section aria-labelledby="outcomes-title" className="case-outcomes">
			<h2 className="case-label" id="outcomes-title">
				what came out of it
			</h2>
			<Reveal>
				<ul className="case-outcome-list" data-count={item.outcomes.length}>
					{item.outcomes.map((outcome) => (
						<li
							className={`case-outcome${outcome.metric.length > 11 ? "is-long" : ""}`}
							data-reveal=""
							key={outcome.label}
						>
							<span className="case-metric">
								<When value={outcome.metric} />
							</span>
							<span className="case-metric-label">{outcome.label}</span>
						</li>
					))}
				</ul>
			</Reveal>
		</section>
	);
}

export function CaseLinks({ item }: { item: Case }) {
	const rows = [
		{ href: item.source, label: "the full write-up" },
		...item.links,
	];
	return (
		<section aria-labelledby="links-title" className="case-links">
			<h2 className="case-label" id="links-title">
				keep reading
			</h2>
			<ul className="case-link-list">
				{rows.map((row) => (
					<li key={row.href}>
						<a
							className="case-link"
							href={row.href}
							rel="noopener noreferrer"
							target="_blank"
						>
							<span className="case-link-label">{row.label}</span>
							<span className="case-link-host">{hostOf(row.href)}</span>
							<span aria-hidden="true" className="case-link-arrow">
								↗
							</span>
							<span className="sr-only"> ({NEW_TAB})</span>
						</a>
					</li>
				))}
			</ul>
		</section>
	);
}
