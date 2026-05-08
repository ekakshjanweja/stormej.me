import { domi, resume } from "@/lib/constants/links";
import Link from "next/link";
import SocialLinks from "./social-links";
import { FileText, Mail } from "lucide-react";

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" data-cursor-anchor="hero">
      <p
        id="hero-heading"
        className="hero-lede text-[clamp(22px,2.6vw,34px)] max-w-[58ch]"
      >
        i build mobile apps that feel <em>fast</em>, <em>clean</em>, and{" "}
        <em>reliable</em>. for the past few years i&apos;ve shipped products at
        early-stage startups, and right now i&apos;m shaping the consumer
        experience at{" "}
        <Link
          href={domi}
          target="_blank"
          rel="noopener noreferrer"
          className="squiggle-link font-serif"
        >
          digitaldomi
        </Link>
        .
      </p>

      <section data-cursor-anchor="elsewhere" className="mt-16">
        <h2 className="section-label mb-6">elsewhere</h2>
        <div className="space-y-1.5 text-[14px] leading-[1.6] font-light text-foreground">
          <p>based in new delhi.</p>
          <p>arch linux on the desktop.</p>
          <p>valorant after hours.</p>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px]">
        <Link
          href={resume}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-foreground hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
        >
          <FileText className="w-3.5 h-3.5" />
          resume
        </Link>
        <Link
          href="https://cal.com/ekaksh-janweja-pfvauh"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-foreground hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
        >
          <Mail className="w-3.5 h-3.5" />
          get in touch
        </Link>
      </div>

      <SocialLinks />
    </section>
  );
}
