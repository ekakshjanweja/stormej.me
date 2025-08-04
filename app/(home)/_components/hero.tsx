import { domi } from "@/lib/constants/links";
import X from "@/components/x";
import Link from "next/link";

export default function Hero() {
  return (
    <>
      <section className="mt-16">
        <div className="space-y-4">
          <p className="text-xl md:text-2xl font-semibold mb-8 tracking-tight">
            ekaksh janweja
          </p>
          <p className="text-sm text-foreground font-light leading-relaxed mb-2">
            hi, i&apos;m a software engineer based out of new delhi. been
            building mobile apps at startups for 2+ years. right now i am
            building the consumer side of{" "}
            <Link
              href={domi}
              target="_blank"
              className="underline decoration-muted-foreground underline-offset-4 hover:decoration-highlight hover:text-highlight transition-colors duration-200"
            >
              digitaldomi
            </Link>
            .
          </p>
          <p className="text-sm text-foreground font-light leading-relaxed mb-2">
            i love ricing my arch setup, tinkering with my homelab, and building
            meaningful products.
          </p>
          <p className="text-sm text-foreground font-light leading-relaxed mt-8">
            if you&apos;re working on something cool, hit me up{" "}
            <Link
              target="_blank"
              href="mailto:jekaksh@gmail.com"
              className="underline decoration-muted-foreground underline-offset-4 hover:decoration-highlight hover:text-highlight transition-colors duration-200"
            >
              here
            </Link>{" "}
            or dm me on{" "}
            <span className="inline-flex items-center gap-1 align-middle">
              <X className="w-4 h-4 ml-1 hover:scale-110 transition-transform duration-200 inline" />
            </span>
            .
          </p>
        </div>
      </section>
    </>
  );
}
