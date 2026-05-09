import { domi, resume } from "@/lib/constants/links";
import Link from "next/link";
import SocialLinks from "./social-links";
import { ArrowUpRight, FileText, Mail } from "lucide-react";
import { LinkPreview } from "@/components/ui/link-preview";

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" data-cursor-anchor="hero">
      <p
        id="hero-heading"
        className="hero-lede text-[clamp(26px,4vw,34px)] max-w-[58ch]"
      >
        buildng mobile apps and shipping products at early-stage startups for
        past few years, right now i&apos;m shaping{" "}
        <LinkPreview url={domi} className="squiggle-link font-serif italic">
          digitaldomi
        </LinkPreview>
        .
      </p>

      <div className="mt-12 flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 text-[13px]">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="https://cal.com/ekaksh-janweja-pfvauh"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-background transition-all duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>get in touch</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            href={resume}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-foreground transition-all duration-200 hover:border-foreground/40 hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>resume</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </Link>
        </div>
        <SocialLinks />
      </div>
    </section>
  );
}
