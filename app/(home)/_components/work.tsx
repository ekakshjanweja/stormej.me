import { work } from "@/lib/constants/work";
import Link from "next/link";

export default function Work() {
  return (
    <>
      <section className="mt-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            work
          </h2>
          {work.length > 2 && (
            <Link
              href="/work"
              className="group relative px-3 py-2 rounded-lg transition-all duration-300 ease-in-out hover:translate-x-0.5 focus:translate-x-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 border border-transparent text-muted-foreground hover:text-foreground hover:border-border/20 hover:bg-accent/10"
            >
              <span className="font-medium transition-all duration-300 ease-in-out">
                view all
              </span>
            </Link>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {work.slice(0, 2).map((work) => (
            <Link key={work.id} href={`/work/${work.id}`} className="group">
              <div className="group relative overflow-hidden rounded-lg border border-border/10 bg-muted/30 hover:border-border/30 hover:bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out cursor-pointer p-4 hover:shadow-sm hover:shadow-primary/5">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary/95 transition-colors duration-200">
                      {work.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium transition-colors duration-200">
                      {work.role}
                    </p>
                  </div>
                  <div className="text-left md:text-right mt-2 md:mt-0">
                    <p className="text-sm text-muted-foreground/70 transition-colors duration-200">
                      {work.startDate
                        .toLocaleString("default", {
                          month: "short",
                          year: "numeric",
                        })
                        .toLowerCase()}{" "}
                      -{" "}
                      {work.endDate
                        ? work.endDate
                            .toLocaleString("default", {
                              month: "short",
                              year: "numeric",
                            })
                            .toLowerCase()
                        : "present"}
                    </p>
                  </div>
                </div>

                {/* Subtle border animation */}
                <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-primary/20 transition-all duration-500" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
