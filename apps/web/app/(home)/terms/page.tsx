import type { Metadata } from "next";
import Link from "next/link";
import { mailTo } from "@/lib/constants/links";

const description =
	"house rules for stormej.me — personal site, private vault, no warranty.";

export const metadata: Metadata = {
	alternates: { canonical: "/terms" },
	description,
	openGraph: {
		description,
		title: "terms | stormej",
		type: "website",
		url: "https://www.stormej.me/terms",
	},
	title: "terms",
	twitter: {
		description,
		title: "terms | stormej",
	},
};

const sections = [
	{
		body: "stormej.me is a personal website. content is shared as-is for reading, browsing, and the occasional resume download. it is not a SaaS, marketplace, or public file host.",
		title: "the site",
	},
	{
		body: "the vault at /vault is private admin storage. it unlocks only with a secret access key held by the site owner. there is no public signup. if you do not have that key, leave. trying to break in is not clever; it is just rude.",
		title: "the vault",
	},
	{
		body: "do not scrape aggressively, attempt to access private endpoints, upload malware, or use the site to harm others. public pages are for people; bots that behave poorly will be treated accordingly.",
		title: "acceptable use",
	},
	{
		body: "unless a page says otherwise, writing and media on this site belong to me. link freely; do not republish whole pieces as your own.",
		title: "content",
	},
	{
		body: "everything here is provided without warranty. things break. files get renamed. the abyss has opinions. use at your own risk.",
		title: "no warranty",
	},
	{
		body: "i may update these terms when the site changes. the date at the top of this page is the source of truth. questions go to email.",
		title: "changes & contact",
	},
];

export default function TermsPage() {
	return (
		<main className="flex flex-col gap-10">
			<section>
				<p className="section-label">terms</p>
				<h1 className="hero-lede mt-5 max-w-[58ch] text-[clamp(26px,4vw,34px)]">
					house rules for a personal site with a locked door in the back.
				</h1>
				<p className="mt-6 max-w-[58ch] text-[14px] text-muted-foreground leading-6">
					last updated august 2026. not lawyer-reviewed. still binding enough
					for common sense.
				</p>
			</section>

			<ul className="flex max-w-[62ch] flex-col gap-8">
				{sections.map(({ title, body }) => (
					<li className="flex flex-col gap-2" key={title}>
						<h2 className="section-label">{title}</h2>
						<p className="text-[14px] text-muted-foreground leading-6">
							{body}
						</p>
					</li>
				))}
			</ul>

			<p className="meta-tag normal-case tracking-[0.08em]">
				<Link className="hover-dim" href={mailTo}>
					jekaksh@gmail.com
				</Link>
				<span aria-hidden className="mx-2 opacity-40">
					·
				</span>
				<Link className="hover-dim" href="/privacy">
					privacy
				</Link>
			</p>
		</main>
	);
}
