import type { Metadata } from "next";
import { LINKS, PERSON, SOCIALS } from "@/lib/profile";
import { Band } from "../_components/band";
import { Brief } from "../_components/brief";
import { Clock } from "../_components/clock";
import { OutLink } from "../_components/out-link";
import { Shell } from "../_components/shell";
import { Line } from "../_components/words";
import { CAL, EMAIL } from "../_lib/content";
import { bareUrl } from "../_lib/format";
import { contactMarkdown } from "../_lib/markdown";

export const metadata: Metadata = {
	description: "book a call, write an email, or find me online.",
	title: "contact · ekaksh janweja · orbit",
};

const ELSEWHERE = [
	...SOCIALS,
	{ href: LINKS.threads, label: "threads" },
	{ href: LINKS.resume, label: "resume" },
];

export default function ContactPage() {
	return (
		<Shell markdown={contactMarkdown()}>
			<Band labelledBy="contact-title" size="short">
				<h1 className="band-crumb" id="contact-title">
					contact
				</h1>
				<Line before="let's make something" word="together" />
				<p className="band-note">pick whichever is easiest.</p>
			</Band>

			<section aria-labelledby="ways-title" className="contact">
				<h2 className="sr-only" id="ways-title">
					ways to reach me
				</h2>
				<div className="contact-main" data-reveal="up">
					<Brief />
				</div>
				<div className="contact-side">
					<div className="contact-call" data-reveal="up">
						<p className="kicker">rather talk</p>
						<p className="pull">thirty minutes is usually enough.</p>
						<OutLink className="pill pill-solid" cursor="book" href={CAL}>
							book a call
						</OutLink>
					</div>
					<div data-reveal="up">
						<Clock />
					</div>
					<p className="contact-mail" data-reveal="up">
						or just write to{" "}
						<a data-cursor="write" href={`mailto:${EMAIL}`}>
							{EMAIL}
						</a>
						.
					</p>
				</div>
			</section>

			<section aria-labelledby="elsewhere-title" className="case-links">
				<h2 className="kicker" id="elsewhere-title">
					elsewhere
				</h2>
				<ul className="out-list">
					{ELSEWHERE.map((link) => (
						<li data-reveal="up" key={link.href}>
							<OutLink className="out-row" cursor="visit" href={link.href}>
								<span className="out-label">{link.label}</span>
								<span className="out-url">{bareUrl(link.href)}</span>
								<i aria-hidden="true">↗</i>
							</OutLink>
						</li>
					))}
				</ul>
				<p className="section-note">
					{PERSON.location}, on india standard time.
				</p>
			</section>
		</Shell>
	);
}
