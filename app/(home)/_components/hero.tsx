import { domi, resume, xDotCom } from "@/lib/constants/links";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SocialLinks from "./social-links";
import { X } from "@/components/ui/svgs/x";
import { Button } from "@/components/ui/button";
import { FileText, Mail } from "lucide-react";

export default function Hero() {
  return (
    <>
      <section aria-labelledby="hero-heading">
        <div className="space-y-3 mt-2 md:mt-12">
          <p className="text-xs md:text-sm text-foreground font-light leading-relaxed">
            hi, i&apos;m a software engineer based out of new delhi. been
            building mobile apps at startups for 2+ years. right now i am
            building the consumer side of{" "}
            <Link
              href={domi}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-muted-foreground underline-offset-4 hover:decoration-highlight hover:text-highlight transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
            >
              digitaldomi
            </Link>
            .
          </p>
          <p className="text-xs md:text-sm text-foreground font-light leading-relaxed">
            i love ricing my arch setup, tinkering with my homelab, and building
            meaningful products.
          </p>
          <p className="text-xs md:text-sm text-foreground font-light leading-relaxed pt-2">
            if you&apos;re working on something cool, hit me up{" "}
            <Link
              target="_blank"
              href="mailto:jekaksh@gmail.com"
              rel="noopener noreferrer"
              className="underline decoration-muted-foreground underline-offset-4 hover:decoration-highlight hover:text-highlight transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
            >
              here
            </Link>{" "}
            or dm me on{" "}
            <Link
              href={xDotCom}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 align-middle underline decoration-muted-foreground underline-offset-4 hover:decoration-highlight hover:text-highlight transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
            >
              <X className="w-3.5 h-3.5 ml-1 hover:scale-110 transition-transform duration-200 inline text-foreground" />
            </Link>
            .
          </p>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-6">
          <Button
            asChild
            variant="outline"
            className="group gap-2 py-5 font-medium rounded-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-md border-border/50 hover:border-border hover:bg-accent/50"
          >
            <Link href={resume} target="_blank" rel="noopener noreferrer">
              <FileText className="w-4 h-4" />
              resume
            </Link>
          </Button>
          <Button
            asChild
            className="group relative gap-2 py-5 font-medium rounded-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-lg bg-accent-foreground text-primary-foreground hover:bg-accent-foreground/90"
          >
            <Link
              href="https://cal.com/ekaksh-janweja-pfvauh"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Mail className="w-4 h-4 transition-transform duration-300" />
              get in touch
            </Link>
          </Button>
        </div>
        {/* Social Links */}clear
        <SocialLinks />
      </section>
    </>
  );
}
