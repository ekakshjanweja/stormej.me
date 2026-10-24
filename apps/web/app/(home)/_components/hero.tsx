"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import { cal, resume } from "@/lib/constants/links";
import SocialLinks from "./social-links";

/* small pill buttons: a solid one to book a call, a quiet outlined one for
   the resume. the arrow nudges toward its corner on hover, a press dips the
   button a touch */
const actionBase =
	"group inline-flex h-9 items-center gap-1.5 rounded-full px-4 font-medium text-[13px] transition-[background-color,border-color,color,scale] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:active:scale-100";
const primaryAction = `${actionBase} bg-foreground text-background hover:bg-foreground/85`;
const secondaryAction = `${actionBase} border border-border text-foreground hover:border-foreground/30 hover:bg-muted`;
const actionArrow =
	"size-3.5 shrink-0 transition-[translate,color] duration-150 ease-out group-hover:translate-x-px group-hover:-translate-y-px motion-reduce:transition-none";

const EYEBROW = "product · mobile · ai";
const HEADLINE =
	"early-stage engineer building products from idea to production.";
const SUBLINE =
	"i work across product, and engineering to turn messy ideas into fast, polished software that people actually use.";

const trackCal = () =>
	track("cta_clicked", { location: "hero", target: "cal" });
const trackResume = () =>
	track("cta_clicked", { location: "hero", target: "resume" });

export default function Hero() {
	return (
		<section
			aria-labelledby="hero-heading"
			className="home-hero"
			data-cursor-anchor="hero"
		>
			<p className="hero-eyebrow meta-tag mb-5">{EYEBROW}</p>

			<h1
				className="hero-lede max-w-[26ch] text-[clamp(2.25rem,4.4vw,3.5rem)] leading-[1.08]! tracking-[-0.015em]!"
				id="hero-heading"
			>
				{HEADLINE}
			</h1>

			<p className="hero-lede mt-5 max-w-[46ch] text-[clamp(1.375rem,2.2vw,1.75rem)] text-muted-foreground leading-[1.25]!">
				{SUBLINE}
			</p>

			<div className="mt-10 flex flex-col gap-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
				<div className="flex flex-wrap items-center gap-3">
					<Link
						className={primaryAction}
						href={cal}
						onClick={trackCal}
						rel="noopener noreferrer"
						target="_blank"
					>
						get in touch
						<ArrowUpRight aria-hidden className={actionArrow} />
					</Link>
					<Link
						className={secondaryAction}
						href={resume}
						onClick={trackResume}
						rel="noopener noreferrer"
						target="_blank"
					>
						resume
						<ArrowUpRight
							aria-hidden
							className={`${actionArrow} text-muted-foreground group-hover:text-foreground`}
						/>
					</Link>
				</div>
				<SocialLinks />
			</div>
		</section>
	);
}
