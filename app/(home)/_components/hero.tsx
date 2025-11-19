import { domi, resume } from "@/lib/constants/links";
import Link from "next/link";
import SocialLinks from "./social-links";
import { Button } from "@/components/ui/button";
import { FileText, Mail } from "lucide-react";

export default function Hero() {
  return (
    <>
      <section aria-labelledby="hero-heading">
        <div className="space-y-3 mt-2 md:mt-12">
          <p className="text-xs md:text-sm text-foreground font-light leading-relaxed">
            hi, i&apos;m ekaksh.
          </p>
          <p className="text-xs md:text-sm text-foreground font-light leading-relaxed">
            i build mobile apps that feel fast, clean and reliable. i&apos;ve
            spent the last couple of years shipping products at early stage
            startups and right now i&apos;m building the consumer experience at{" "}
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
            i enjoy taking product problems apart and building clean solutions.
          </p>
          <div className="text-xs md:text-sm text-foreground font-light leading-relaxed space-y-1 pt-2">
            <p>other things about me:</p>
            <p>i use arch btw.</p>
            <p>i play valorant.</p>
          </div>
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
        {/* Social Links */}
        <SocialLinks />
      </section>
    </>
  );
}
