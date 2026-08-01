import type { Metadata } from "next";
import Link from "next/link";
import { mailTo } from "@/lib/constants/links";

const description =
	"what stormej.me collects, stores, and ignores — short version.";

export const metadata: Metadata = {
	alternates: { canonical: "/privacy" },
	description,
	openGraph: {
		description,
		title: "privacy | stormej",
		type: "website",
		url: "https://www.stormej.me/privacy",
	},
	title: "privacy",
	twitter: {
		description,
		title: "privacy | stormej",
	},
};

const sections = [
	{
		body: "this is a personal site. the vault behind /vault is private admin storage, not a public product. i do not sell your data. there is nothing interesting enough to sell.",
		title: "the short version",
	},
	{
		body: "the vault unlocks with a private access key known only to me. a successful unlock sets a first-party HttpOnly cookie on stormej.me so the browser can call admin endpoints. visitors never create accounts, and i do not collect google profile data for vault access.",
		title: "vault access",
	},
	{
		body: "files uploaded to the vault live in a private cloudflare r2 bucket. public reads under /files are only for objects i choose to expose (like a resume). everything else stays behind the vault cookie.",
		title: "vault files",
	},
	{
		body: "the site may use posthog for anonymous-ish product analytics (page views, basic usage). you can block it with usual tracker / cookie controls. analytics is not tied to vault file contents.",
		title: "analytics",
	},
	{
		body: "live cursors on some pages use a websocket to a cloudflare durable object. that traffic is ephemeral presence, not an identity dossier.",
		title: "realtime",
	},
	{
		body: "the vault cookie lasts until i sign out or it expires. if you have a privacy question, email me.",
		title: "retention & contact",
	},
];

export default function PrivacyPage() {
	return (
		<main className="flex flex-col gap-10">
			<section>
				<p className="section-label">privacy</p>
				<h1 className="hero-lede mt-5 max-w-[58ch] text-[clamp(26px,4vw,34px)]">
					what gets collected, what stays private, and what i ignore on purpose.
				</h1>
				<p className="mt-6 max-w-[58ch] text-[14px] text-muted-foreground leading-6">
					last updated august 2026. written for humans, not for a compliance
					team with a word count quota.
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
				<Link className="hover-dim" href="/terms">
					terms
				</Link>
			</p>
		</main>
	);
}
