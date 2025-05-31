import { domi } from "@/lib/constants/links";
import HeadlineLarge from "@/components/styles/headline-large";
import X from "@/components/x";
import Link from "next/link";

export default function Hero() {
  return (
    <main>
      <section className="relative">
        {/* Header Section */}
        <header className="mb-6 sm:mb-8 lg:mb-10">
          <HeadlineLarge text="ekaksh janweja" className="!mb-0" />
        </header>

      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Introduction */}
        <div className="prose prose-lg max-w-none">
          <p className="text-base lg:text-lg text-foreground font-light leading-relaxed">
            hey, i&apos;m an engineer based out of delhi. i build apps and cool shit
            on the side. been working with startups for about 2 years now, if you're
            building something fire hit me up.
          </p>
        </div>

        {/* Current Work */}
        <div className="prose prose-lg max-w-none">
          <p className="text-base lg:text-lg text-foreground font-light leading-relaxed">
            right now, building{" "}
            <Link
              target="_blank"
              href={domi}
              className="underline decoration-muted-foreground underline-offset-4 hover:decoration-highlight hover:text-highlight transition-colors duration-200"
            >
              digitaldomi&apos;s
            </Link>{" "}
            mobile app while streamlining development workflows using ofc ai. also i
            am maintaining a flutter sdk for{" "}
            <Link
              target="_blank"
              href={"https://www.better-auth.com/"}
              className="underline decoration-muted-foreground underline-offset-4 hover:decoration-highlight hover:text-highlight transition-colors duration-200"
            >
              better-auth
            </Link>
            .
          </p>
        </div>

        {/* Contact */}
        <div className="prose prose-lg max-w-none">
          <p className="flex items-center flex-wrap gap-2 text-base lg:text-lg text-foreground font-light leading-relaxed">
            we can talk{" "}
            <Link
              target="_blank"
              href={"mailto:jekaksh@gmail.com"}
              className="underline decoration-muted-foreground underline-offset-4 hover:decoration-highlight hover:text-highlight transition-colors duration-200"
            >
              here
            </Link>{" "}
            or dm me on{" "}
            <X className="w-4 h-4 hover:scale-110 transition-transform duration-200" />
          </p>
        </div>
      </div>
      </section>
    </main>
  );
}
