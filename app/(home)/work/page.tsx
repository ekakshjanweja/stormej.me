import { work } from "@/lib/constants/work-old";
import Link from "next/link";

export default function Work() {
  return (
    <main>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          work
        </h1>
      </div>

      {/* Work Experience List */}
      <div className="flex flex-col gap-6">
        {work.map((item) => (
          <Link key={item.id} href={`/work/${item.id}`} className="group">
            <div className="group relative overflow-hidden rounded-lg border border-border/10 bg-muted/30 hover:border-border/30 hover:bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out cursor-pointer p-4 hover:shadow-sm hover:shadow-primary/5">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="relative flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium transition-colors duration-300">
                      {item.role}
                    </p>
                  </div>
                  <div className="text-left md:text-right mt-2 md:mt-0">
                    <p className="text-sm text-muted-foreground/70 transition-colors duration-300">
                      {item.date}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-sm text-muted-foreground/80 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Subtle border animation */}
              <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-primary/20 transition-all duration-500" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
