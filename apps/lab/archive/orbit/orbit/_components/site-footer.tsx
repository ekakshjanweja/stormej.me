import Link from "next/link";
import { LAB_INDEX, withBase } from "@/lib/base";
import { PERSON, SITE, SOCIALS } from "@/lib/profile";
import { ROUTES, WORLD_ORDER, WORLDS } from "../_lib/content";
import { OutLink } from "./out-link";

/* the bottom of every page that isn't the ring: everywhere in orbit, and
   everywhere else */

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<div className="footer-top">
				<p className="footer-name">
					ekaksh janweja<span aria-hidden="true">.</span>
				</p>
				<nav aria-label="everywhere in orbit" className="footer-nav">
					<Link href={ROUTES.home}>the ring</Link>
					{WORLD_ORDER.map((id) => (
						<Link
							href={WORLDS[id].href}
							key={id}
							style={{ "--world": WORLDS[id].color } as React.CSSProperties}
						>
							{WORLDS[id].label}
						</Link>
					))}
					<Link href={ROUTES.about}>about</Link>
					<Link href={ROUTES.contact}>contact</Link>
				</nav>
			</div>
			<div className="footer-bottom">
				<ul aria-label="elsewhere" className="footer-socials">
					{SOCIALS.map((social) => (
						<li key={social.href}>
							<OutLink href={social.href}>{social.label}</OutLink>
						</li>
					))}
				</ul>
				<p className="footer-note">
					{PERSON.location}. an experiment from{" "}
					<a href={withBase(LAB_INDEX)}>the lab</a>; the real site is{" "}
					<a href={SITE}>stormej.me</a>.
				</p>
			</div>
		</footer>
	);
}
