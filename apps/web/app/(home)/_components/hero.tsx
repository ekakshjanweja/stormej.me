"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { HeroHeadline } from "@/components/design/effects/hero-headline";
import { useHeroCopy } from "@/components/design/preview-bridge";
import { track } from "@/lib/analytics";
import { cal, resume } from "@/lib/constants/links";
import SocialLinks from "./social-links";

const actionLinkClass =
	"meta-tag hover-dim inline-flex items-center gap-1.5 rounded py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 sm:py-0";

const trackCal = () =>
	track("cta_clicked", { location: "hero", target: "cal" });
const trackResume = () =>
	track("cta_clicked", { location: "hero", target: "resume" });

export default function Hero() {
	// written in the vault's design studio, see lib/design/options.ts
	const { cta, eyebrow, headline, subline } = useHeroCopy();

	return (
		<section
			aria-labelledby="hero-heading"
			className="home-hero"
			data-cursor-anchor="hero"
		>
			{/* decoration for the intro designs in app/design.css; hidden unless
			    a [data-hero] asks for it, and never read out */}
			<span aria-hidden className="hero-marks" />
			<p aria-hidden className="hero-name">
				ekaksh janweja
			</p>
			<div aria-hidden className="hero-marquee">
				<span>{headline}</span>
				<span>{headline}</span>
			</div>

			{eyebrow ? <p className="hero-eyebrow meta-tag mb-5">{eyebrow}</p> : null}

			<h1
				className="hero-lede max-w-[58ch] text-2xl leading-[1.35]"
				id="hero-heading"
			>
				<HeroHeadline text={headline} />
			</h1>

			{subline ? (
				<p className="hero-lede mt-5 max-w-[58ch] text-2xl text-muted-foreground leading-[1.35]">
					{subline}
				</p>
			) : null}

			<div className="mt-10 flex flex-col gap-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
				<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
					<Link
						className={actionLinkClass}
						href={cal}
						onClick={trackCal}
						rel="noopener noreferrer"
						target="_blank"
					>
						{cta}
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
