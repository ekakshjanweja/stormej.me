import {
	LINKS,
	PERSON,
	STACK,
	STATS,
	WORK,
	yearsShipping,
} from "@/lib/profile";
import { ExternalLink } from "./external-link";
import type { FaceCard } from "./faces";

/* what the about page said, told in three cards the home's faces open:
   who i am, how i work, what i build with. all of it from the profile, so
   it stays true */

const NOW = WORK.find((job) => job.end === null);

const PRACTICE = [
	"0 → 1 products",
	"founding-team work",
	"mobile ux",
	"voice and ai agents",
	"reverse engineering hardware",
] as const;

export const INTRO_CARD: FaceCard = {
	content: (
		<>
			<p className="face-card-text">
				i'm an {PERSON.tagline} {PERSON.subline}
			</p>
			{NOW ? (
				<p className="face-card-now">
					right now: {NOW.role} at <em>{NOW.company}</em>.
				</p>
			) : null}
		</>
	),
	label: "hi there",
};

export const PRACTICE_CARD: FaceCard = {
	content: (
		<>
			<ul className="face-card-list">
				{PRACTICE.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
			<p className="face-card-meta">
				{STATS.startups} teams · {yearsShipping()} years shipping ·{" "}
				{STATS.contributions2025.toLocaleString("en-US")} contributions in 2025
			</p>
		</>
	),
	label: "how i work",
};

export const STACK_CARD: FaceCard = {
	content: (
		<>
			<ul className="face-card-chips">
				{STACK.map((item) => (
					<li key={item}>{item}</li>
				))}
			</ul>
			<p className="face-card-meta">based in {PERSON.location}</p>
			<ExternalLink
				className="s-detail face-card-link"
				data-cursor="nav"
				href={LINKS.cal}
			>
				get in touch <span aria-hidden="true">→</span>
			</ExternalLink>
		</>
	),
	label: "what i build with",
};
