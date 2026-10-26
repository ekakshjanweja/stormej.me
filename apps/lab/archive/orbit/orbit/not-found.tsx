import Link from "next/link";
import { Band } from "./_components/band";
import { Shell } from "./_components/shell";
import { Line } from "./_components/words";
import { ROUTES, WORLD_ORDER, WORLDS } from "./_lib/content";
import { notFoundMarkdown } from "./_lib/markdown";

/* a wrong turn inside orbit: an empty sky, and the ways back */

export default function NotFound() {
	return (
		<Shell markdown={notFoundMarkdown()}>
			<Band labelledBy="lost-title" size="short">
				<h1 className="band-crumb" id="lost-title">
					not found
				</h1>
				<Line before="nothing hangs" word="here" />
				<p className="band-note">
					<Link href={ROUTES.home}>back to the ring</Link>
				</p>
			</Band>
			<nav aria-label="ways back" className="lost">
				<ul className="out-list">
					{WORLD_ORDER.map((id) => (
						<li key={id}>
							<Link className="out-row" data-cursor="go" href={WORLDS[id].href}>
								<span className="out-label">{WORLDS[id].label}</span>
								<span className="out-url">{WORLDS[id].title}</span>
								<i aria-hidden="true">→</i>
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</Shell>
	);
}
