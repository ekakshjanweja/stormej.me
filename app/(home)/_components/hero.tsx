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

      <div className="mt-10 flex w-full max-w-[58ch] flex-col gap-6 text-[13px] sm:mt-12 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-6">
        <div className="flex w-full gap-3 sm:w-auto max-sm:[&>a]:min-h-11 max-sm:[&>a]:flex-1 max-sm:[&>a]:justify-center">
          <Link
            href="https://cal.com/ekaksh-janweja-pfvauh"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-4 py-3 text-background transition-all duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 sm:py-2"
          >
            <Mail className="size-4 shrink-0 sm:size-3.5" aria-hidden />
            <span className="tabular-nums">get in touch</span>
            <ArrowUpRight
              className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:size-3.5"
              aria-hidden
            />
          </Link>
          <Link
            href={resume}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-3 text-foreground transition-all duration-200 hover:border-foreground/40 hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 sm:py-2"
          >
            <FileText className="size-4 shrink-0 sm:size-3.5" aria-hidden />
            <span className="tabular-nums">resume</span>
            <ArrowUpRight
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground sm:size-3.5"
              aria-hidden
            />
          </Link>
        </div>
        <div className="flex w-full shrink-0 items-center pl-2 pt-5 sm:w-auto sm:border-0 sm:pt-0">
          <SocialLinks />
        </div>
      </div>
    </section>
  );
}
