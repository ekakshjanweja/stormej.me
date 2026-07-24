"use client";

import { fpvLabs, resume } from "@/lib/constants/links";
import Link from "next/link";
import SocialLinks from "./social-links";
import { ArrowUpRight } from "lucide-react";
import { LinkPreview } from "@/components/ui/link-preview";
import { track } from "@/lib/analytics";

const CAL_URL = "https://cal.com/ekaksh-janweja-pfvauh";

const actionLinkClass =
  "meta-tag hover-dim inline-flex items-center gap-1.5 rounded py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 sm:py-0";

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" data-cursor-anchor="hero">
      <span className="sr-only">
        ekaksh janweja. mobile engineer building fast, reliable software across
        ai, robotics, and consumer products. currently solving data capture for
        physical intelligence at fpv labs.
      </span>

      <h1
        id="hero-heading"
        className="hero-lede max-w-[58ch] text-2xl leading-[1.35]"
      >
        mobile engineer building fast, reliable software across ai, robotics,
        and consumer products.
      </h1>

      <p className="hero-lede mt-5 max-w-[58ch] text-2xl leading-[1.35] text-muted-foreground">
        currently solving data capture for physical intelligence at{" "}
        <LinkPreview
          url={fpvLabs}
          className="squiggle-link font-serif italic !text-[var(--text-highlight)]"
        >
          fpv labs
        </LinkPreview>
        .
      </p>

      <div className="mt-10 flex flex-col gap-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track("cta_clicked", { location: "hero", target: "cal" })
            }
            className={actionLinkClass}
          >
            get in touch
            <ArrowUpRight className="size-3 shrink-0" aria-hidden />
          </Link>
          <Link
            href={resume}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track("cta_clicked", { location: "hero", target: "resume" })
            }
            className={actionLinkClass}
          >
            resume
            <ArrowUpRight className="size-3 shrink-0" aria-hidden />
          </Link>
        </div>
        <SocialLinks />
      </div>
    </section>
  );
}
