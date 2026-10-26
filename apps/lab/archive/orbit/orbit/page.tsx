import Link from "next/link";
import { SITE } from "@/lib/profile";
import { Orbit } from "./_components/orbit";
import {
	CAL,
	CARDS,
	EMAIL,
	isExternal,
	ROUTES,
	STATS,
	WORLD_ORDER,
	WORLDS,
} from "./_lib/content";
import { homeMarkdown } from "./_lib/markdown";

export default function Home() {
	return (
		<Orbit markdown={homeMarkdown()} stats={STATS}>
			{/* the ring is decorative motion; this is the same page as plain
			    content for screen readers and crawlers */}
			<section aria-labelledby="outline" className="sr-only">
				<h2 id="outline">what ekaksh does</h2>
				<p>
					ekaksh janweja is an early-stage engineer building products from idea
					to production, mostly mobile and ai.
				</p>
				{WORLD_ORDER.map((id) => (
					<div key={id}>
						<h3>
							<Link href={WORLDS[id].href}>{WORLDS[id].title}</Link>
						</h3>
						<ul>
							{CARDS.filter((card) => card.world === id).map((card) =>
								isExternal(card.href) ? (
									<li key={card.id}>
										<a
											href={card.href}
											rel="noopener noreferrer"
											target="_blank"
										>
											{card.title}
											<span> (on stormej.me, opens in a new tab)</span>
										</a>
									</li>
								) : (
									<li key={card.id}>
										<Link href={card.href}>{card.title}</Link>
									</li>
								)
							)}
						</ul>
					</div>
				))}
				<h3>
					<Link href={ROUTES.about}>about me</Link>
				</h3>
				<h2>say hi</h2>
				<p>
					<Link href={ROUTES.contact}>get in touch</Link>,{" "}
					<a href={CAL} rel="noopener noreferrer" target="_blank">
						book a call
					</a>{" "}
					or write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. the full site
					lives at <a href={SITE}>stormej.me</a>.
				</p>
			</section>
		</Orbit>
	);
}
