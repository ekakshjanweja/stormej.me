import { domi } from "@/lib/constants/links";
import HeadlineLarge from "@/components/styles/headline-large";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative group">
      {/* Header Section */}
      <header className="mb-6 sm:mb-8 lg:mb-10">
        <div className="transform transition-all duration-500 hover:translate-x-1">
          <HeadlineLarge text="ekaksh janweja" className="!mb-0" />
        </div>
      </header>

      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Introduction */}
        <div className="prose prose-lg max-w-none">
          <p className="text-base lg:text-lg text-foreground font-light leading-relaxed opacity-90 transition-all duration-500 hover:opacity-100 hover:translate-x-2">
            hey, i&apos;m an engineer based out of delhi. i build apps and cool shit
            on the side. been working with startups for about 2 years now, if you're
            building something fire hit me up.
          </p>
        </div>

        {/* Current Work */}
        <div className="prose prose-lg max-w-none">
          <p className="text-base lg:text-lg text-foreground font-light leading-relaxed opacity-90 transition-all duration-500 hover:opacity-100 hover:translate-x-2">
            right now, building{" "}
            <Link
              target="_blank"
              href={domi}
              className="relative inline-flex items-center underline decoration-muted-foreground underline-offset-4 hover:decoration-highlight hover:text-highlight transition-all duration-300 group/link transform hover:rotate-1"
            >
              <span className="relative z-10">digitaldomi&apos;s</span>
              <span className="absolute -inset-2 bg-gradient-to-r from-highlight/20 to-accent/20 rounded-md opacity-0 group-hover/link:opacity-100 transition-all duration-300 -z-10 blur-sm group-hover/link:blur-none"></span>
              <span className="absolute -inset-1 bg-highlight/10 rounded opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -z-10"></span>
            </Link>{" "}
            mobile app while streamlining development workflows using ofc ai. also i
            am maintaining a flutter sdk for{" "}
            <Link
              target="_blank"
              href={"https://www.better-auth.com/"}
              className="relative inline-flex items-center underline decoration-muted-foreground underline-offset-4 hover:decoration-highlight hover:text-highlight transition-all duration-300 group/link transform hover:rotate-1"
            >
              <span className="relative z-10">better-auth</span>
              <span className="absolute -inset-2 bg-gradient-to-r from-highlight/20 to-accent/20 rounded-md opacity-0 group-hover/link:opacity-100 transition-all duration-300 -z-10 blur-sm group-hover/link:blur-none"></span>
              <span className="absolute -inset-1 bg-highlight/10 rounded opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -z-10"></span>
            </Link>
            .
          </p>
        </div>

        {/* Contact */}
        <div className="prose prose-lg max-w-none">
          <p className="flex items-center flex-wrap gap-2 text-base lg:text-lg text-foreground font-light leading-relaxed opacity-90 transition-all duration-500 hover:opacity-100 hover:translate-x-2">
            we can talk{" "}
            <Link
              target="_blank"
              href={"mailto:jekaksh@gmail.com"}
              className="relative inline-flex items-center underline decoration-muted-foreground underline-offset-4 hover:decoration-highlight hover:text-highlight transition-all duration-300 group/link transform hover:rotate-1"
            >
              <span className="relative z-10">here</span>
              <span className="absolute -inset-2 bg-gradient-to-r from-highlight/20 to-accent/20 rounded-md opacity-0 group-hover/link:opacity-100 transition-all duration-300 -z-10 blur-sm group-hover/link:blur-none"></span>
              <span className="absolute -inset-1 bg-highlight/10 rounded opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -z-10"></span>
            </Link>{" "}
            or dm me on social media
          </p>
        </div>
      </div>

      {/* Enhanced Background Elements */}
      <div className="absolute -inset-6 bg-gradient-to-br from-highlight/5 via-transparent to-muted/5 rounded-3xl -z-20 opacity-0 transition-all duration-700 group-hover:opacity-100 pointer-events-none"></div>
      
      {/* Floating particles effect */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-highlight/30 rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse transform group-hover:translate-x-4 group-hover:-translate-y-2"></div>
      <div className="absolute top-1/4 right-0 w-1 h-1 bg-accent/40 rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-200 animate-pulse transform group-hover:-translate-x-6 group-hover:translate-y-3"></div>
      <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-highlight/20 rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-500 animate-pulse transform group-hover:translate-x-8 group-hover:-translate-y-4"></div>
    </section>
  );
}
