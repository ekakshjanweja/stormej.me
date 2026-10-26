import type { Metadata } from "next";
import { PERSON } from "@/lib/profile";
import { PageHero } from "../_components/page-hero";

export const metadata: Metadata = {
	description: "what this experiment collects. almost nothing.",
	title: "privacy",
};

/* short and plain on purpose. keep it true to the code: no analytics, no
   cookies, and the spotify route only reads his own listening */

export default function PrivacyPage() {
	return (
		<>
			<PageHero eyebrow="privacy" title="privacy">
				<p>what this experiment collects. almost nothing.</p>
			</PageHero>
			<article className="privacy">
				<section aria-labelledby="privacy-collect">
					<h2 id="privacy-collect">what's collected</h2>
					<p>there are no analytics here.</p>
					<p>there are no cookies and no trackers.</p>
					<p>nothing you do on these pages is stored.</p>
				</section>
				<section aria-labelledby="privacy-spotify">
					<h2 id="privacy-spotify">spotify</h2>
					<p>the speakers show what ekaksh is listening to.</p>
					<p>
						that comes from his own spotify account, through a small route on
						this site.
					</p>
					<p>it never asks for yours.</p>
					<p>the album covers load straight from spotify's servers.</p>
				</section>
				<section aria-labelledby="privacy-hosting">
					<h2 id="privacy-hosting">hosting</h2>
					<p>the site runs on vercel.</p>
					<p>
						like any host, vercel sees the requests your browser makes, such as
						your ip address.
					</p>
					<p>videos and images are served from the same place.</p>
				</section>
				<section aria-labelledby="privacy-links">
					<h2 id="privacy-links">links out</h2>
					<p>
						links to instagram, linkedin, github and stormej.me open in a new
						tab.
					</p>
					<p>those sites have their own rules.</p>
				</section>
				<section aria-labelledby="privacy-contact">
					<h2 id="privacy-contact">questions</h2>
					<p>
						write to <a href={`mailto:${PERSON.email}`}>{PERSON.email}</a>.
					</p>
				</section>
			</article>
		</>
	);
}
