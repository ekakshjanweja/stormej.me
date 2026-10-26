import { LAB_INDEX, withBase } from "@/lib/base";
import { LINKS, PERSON } from "@/lib/profile";
import { ExternalLink } from "./external-link";
import { SpeakersMini } from "./speakers";
import { StudioLink } from "./studio-link";

/* what's on the speakers (when spotify is set up), then four short
   columns: the studio's pages, how to reach him, elsewhere, and the way
   back out of the experiment */

export function SiteFoot() {
	return (
		<footer className="site-foot">
			<SpeakersMini />
			<nav aria-label="studio pages" className="site-foot-col">
				<p className="site-foot-label">studio</p>
				<ul>
					<li>
						<StudioLink href="/studio">home</StudioLink>
					</li>
					<li>
						<StudioLink href="/studio/work">work</StudioLink>
					</li>
					<li>
						<StudioLink href="/studio/writing">notes</StudioLink>
					</li>
					<li>
						<StudioLink href="/studio/about">about</StudioLink>
					</li>
				</ul>
			</nav>
			<div className="site-foot-col">
				<p className="site-foot-label">say hi</p>
				<ul>
					<li>
						<a href={`mailto:${PERSON.email}`}>{PERSON.email}</a>
					</li>
					<li>
						<ExternalLink href={LINKS.cal}>book a call</ExternalLink>
					</li>
				</ul>
			</div>
			<div className="site-foot-col">
				<p className="site-foot-label">elsewhere</p>
				<ul>
					<li>
						<ExternalLink href={LINKS.linkedin}>linkedin</ExternalLink>
					</li>
					<li>
						<ExternalLink href={LINKS.github}>github</ExternalLink>
					</li>
					<li>
						<ExternalLink href={LINKS.instagram}>instagram</ExternalLink>
					</li>
				</ul>
			</div>
			<div className="site-foot-col">
				<p className="site-foot-label">this experiment</p>
				<ul>
					<li>
						<a href={withBase(LAB_INDEX)}>back to the lab</a>
					</li>
					<li>
						<ExternalLink href={LINKS.site}>stormej.me</ExternalLink>
					</li>
					<li>
						<StudioLink href="/studio/privacy">privacy</StudioLink>
					</li>
				</ul>
			</div>
		</footer>
	);
}
