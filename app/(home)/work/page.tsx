import { work } from "@/lib/constants/work-old";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
        {work.map((item, index) => (
          <Link key={item.id} href={`/work/${item.id}`} className="group">
            <div
              className={cn(
                "group relative overflow-hidden rounded-lg",
                "border border-border/10 bg-muted/30",
                "hover:border-border/50 dark:hover:border-border/40",
                "hover:bg-muted/50 dark:hover:bg-card/70",
                "backdrop-blur-sm transition-all duration-700 ease-in-out",
                "cursor-pointer p-4",
                "hover:shadow-md hover:shadow-primary/10 dark:hover:shadow-primary/5",
                "transform-gpu"
              )}
            >
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/5 dark:via-transparent dark:to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out" />

              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out bg-gradient-to-r from-transparent via-primary/5 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100" />

              {/* Content */}
              <div className="relative flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-700 ease-in-out">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium transition-colors duration-700 ease-in-out group-hover:text-muted-foreground/90">
                      {item.role}
                    </p>
                  </div>
                  <div className="text-left md:text-right mt-2 md:mt-0">
                    <p className="text-sm text-muted-foreground/70 transition-colors duration-700 ease-in-out group-hover:text-muted-foreground/90">
                      {item.date}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-sm text-muted-foreground/80 leading-relaxed group-hover:text-muted-foreground/90 transition-colors duration-700 ease-in-out">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Animated border */}
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-primary/30 transition-all duration-700 ease-in-out" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
