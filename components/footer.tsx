import Link from "next/link";
import { Lock } from "lucide-react";
import { FooterClock } from "./footer-clock";

export default function Footer() {
  return (
    <footer className="mt-24 px-4 py-8 flex items-center justify-between">
      <span className="display-accent text-[18px] font-medium text-foreground">
        stormej
      </span>
      <span className="meta-tag inline-flex items-center gap-2">
        <span>© {new Date().getFullYear()} · new delhi</span>
        <span aria-hidden className="opacity-40">
          ·
        </span>
        <FooterClock />
        <span aria-hidden className="opacity-40">
          ·
        </span>
        <Link
          href="/vault"
          className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Open vault"
        >
          <Lock className="size-3.5" />
        </Link>
      </span>
    </footer>
  );
}
