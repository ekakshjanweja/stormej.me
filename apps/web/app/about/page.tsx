import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { LocalContext } from "@/components/local-context";
import { ModeToggle } from "@/components/mode-toggle";
import {
	github,
	linkedin,
	mailTo,
	resume,
	xDotCom,
} from "@/lib/constants/links";
import { TROVE_ENABLED } from "@/lib/trove-config";

export const metadata: Metadata = {
	alternates: { canonical: "/about" },
	description:
		"early-stage engineer building products from idea to production. mobile engineer at bullzeye.",
	title: "about",
};

/** outside links open in a new tab; mailto hands off to the mail app */
function Ext({ children, href }: { children: ReactNode; href: string }) {
	if (href.startsWith("mailto:")) {
		return (
			<a className="letter-link" href={href}>
				{children}
			</a>
		);
	}
	return (
		<a
			className="letter-link"
			href={href}
			rel="noopener noreferrer"
			target="_blank"
		>
			{children}
		</a>
	);
}

const contactLinks = [
	{ href: mailTo, label: "jekaksh@gmail.com" },
	{ href: xDotCom, label: "x" },
	{ href: github, label: "github" },
	{ href: linkedin, label: "linkedin" },
	{ href: resume, label: "resume" },
];

/** links within the site */
function Int({ children, href }: { children: ReactNode; href: string }) {
	return (
		<Link className="letter-link" href={href}>
			{children}
		</Link>
	);
}

/**
 * A one-page letter: who i am, what i've built, how to reach me. Stands
 * alone without the navbar or footer (components/site-chrome.tsx). Header,
 * body and footer share one reading column so their edges line up.
 */
export default function AboutPage() {
	return (
		<div className="letter mx-auto flex min-h-svh w-full max-w-[40rem] flex-col justify-center px-6 py-10">
			<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="headline text-[30px] leading-none">ekaksh janweja</h1>
				<div className="flex items-center gap-3 sm:-mr-2">
					<LocalContext />
					<ModeToggle />
				</div>
			</header>

			<section aria-label="about" className="mt-8 space-y-5">
				<p className="hero-lede text-[22px] leading-snug">
					early-stage engineer taking products from idea to production, simple
					and fast. currently a mobile engineer at{" "}
					<Ext href="https://bullzeyegolf.com/">bullzeye</Ext>.
				</p>

				<ul className="list-disc space-y-1.5 pl-5 marker:text-muted-foreground">
					<li>
						at bullzeye i build spatial capture and geometry systems on iphone
						lidar: depth, alignment and confidence for physical-world
						applications.
					</li>
					<li>
						at <Ext href="https://www.fpvlabs.ai/">fpv labs</Ext> i built
						flutter apps with arkit and arcore, plus multipart upload pipelines
						for field data capture on ios and android.
					</li>
					<li>
						worked on{" "}
						<Ext href="https://arxiv.org/abs/2605.05945">
							mobileego anywhere
						</Ext>
						, open infrastructure and a 200-hour dataset for long horizon
						egocentric video on commodity phones.
					</li>
					<li>
						as founding mobile engineer at{" "}
						<Ext href="https://digitaldomi.com/">digital domi</Ext> i led mobile
						from scratch in flutter.
					</li>
				</ul>

				<p>
					i write about what i learn building things: making{" "}
					<Int href="/blog/large-file-upload-system-flutter">
						large uploads reliable in flutter
					</Int>{" "}
					across flaky networks and background execution, and{" "}
					<Int href="/blog/mobile-ar-recorder-end-to-end">
						a mobile ar recorder end to end
					</Int>
					, from deterministic sampling to multipart uploads.
				</p>

				<p>
					outside work i build small products:{" "}
					<Ext href="https://burrow.ekaksh.in">burrow</Ext>, a menu bar app that
					cleans your mac and backs it up to a homelab over ssh,{" "}
					<Ext href="https://aarthiqai.com">aarthiq</Ext>, an ai advisor for
					planning a home loan, and{" "}
					<Ext href="https://pub.dev/packages/better_auth_flutter">
						better-auth-flutter
					</Ext>
					, a flutter client for better-auth.
					{TROVE_ENABLED ? (
						<>
							{" "}
							<Int href="/trove">trove</Int> is the flutter stuff i actually
							use, one file per component.
						</>
					) : null}
				</p>

				<p>
					before that i interned at{" "}
					<Ext href="https://www.getmerlin.in/">merlin</Ext>, building features
					for its flutter app,{" "}
					<Ext href="https://teamblackbox.in/">team black box</Ext>, across ui,
					nlp and geo features, and <Ext href="https://www.zuai.co/">zuai</Ext>,
					my first internship.
				</p>
			</section>

			<footer className="mt-8">
				<nav
					aria-label="contact and links"
					className="flex flex-col gap-3 border-border border-t pt-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
				>
					<ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
						{contactLinks.map(({ href, label }) => (
							<li key={label}>
								<Ext href={href}>{label}</Ext>
							</li>
						))}
					</ul>
					<Int href="/">the rest of the site</Int>
				</nav>
			</footer>
		</div>
	);
}
