"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { LinkPreview } from "@/components/ui/link-preview";
import { track } from "@/lib/analytics";
import { fpvLabs, resume } from "@/lib/constants/links";
import SocialLinks from "./social-links";

const CAL_URL = "https://cal.com/ekaksh-janweja-pfvauh";

const actionLinkClass =
	"meta-tag hover-dim inline-flex items-center gap-1.5 rounded py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 sm:py-0";

const trackCal = () =>
	track("cta_clicked", { location: "hero", target: "cal" });
const trackResume = () =>
	track("cta_clicked", { location: "hero", target: "resume" });

export default function Hero() {
	return (
		<section aria-labelledby="hero-heading" data-cursor-anchor="hero">
			<p className="section-label mb-5">ekaksh janweja</p>

			<h1
				className="hero-lede max-w-[58ch] text-2xl leading-[1.35]"
				id="hero-heading"
			>
				mobile engineer building fast, reliable software across ai, robotics,
				and consumer products.
			</h1>

			<p className="hero-lede mt-5 max-w-[58ch] text-2xl text-muted-foreground leading-[1.35]">
				currently solving data capture for physical intelligence at{" "}
				<LinkPreview
					className="squiggle-link !text-[var(--text-highlight)] font-serif italic"
					url={fpvLabs}
				>
					fpv labs
				</LinkPreview>
				.
			</p>

			<p className="mt-6 max-w-[58ch] text-[14px] text-muted-foreground leading-6">
				<strong className="font-medium text-foreground">ekaksh janweja</strong>{" "}
				— personal site and portfolio on stormej.me: work, writing, projects,
				and a public resume. the site itself is public; no login is required to
				browse. google sign-in requests your google account email and basic
				profile only so i (the site owner) can access a private admin vault for
				resumes and files. that vault is not open to other users. details in the{" "}
				<Link className="underline-offset-4 hover:underline" href="/privacy">
					privacy policy
				</Link>{" "}
				and{" "}
				<Link className="underline-offset-4 hover:underline" href="/terms">
					terms
				</Link>
				.
			</p>

			<div className="mt-10 flex flex-col gap-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
				<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
					<Link
						className={actionLinkClass}
						href={CAL_URL}
						onClick={trackCal}
						rel="noopener noreferrer"
						target="_blank"
					>
						get in touch
						<ArrowUpRight aria-hidden className="size-3 shrink-0" />
					</Link>
					<Link
						className={actionLinkClass}
						href={resume}
						onClick={trackResume}
						rel="noopener noreferrer"
						target="_blank"
					>
						resume
						<ArrowUpRight aria-hidden className="size-3 shrink-0" />
					</Link>
				</div>
				<SocialLinks />
			</div>
		</section>
	);
}
