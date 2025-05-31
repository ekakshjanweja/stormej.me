import MiniCard from "@/components/mini-card";
import HeadlineLarge from "@/components/styles/headline-large";
import HeadlineSmall from "@/components/styles/headline-small";
import ViewMore from "@/components/view-more";
import { work } from "@/lib/constants/work";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const prms = await params;
  const slug = prms.slug;

  const item = work.find((item) => item.id === slug);

  if (item === undefined) {
    notFound();
  }

  return (
    <div className="relative min-h-screen">
      {/* Minimal Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-bl from-highlight/2 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/5 w-80 h-80 bg-gradient-to-br from-accent/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gradient-to-tl from-primary/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-gradient-to-tr from-highlight/2 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Back Navigation */}
      <Link
        href="/work"
        className={cn(
          "group inline-flex items-center gap-2 mb-8",
          "text-sm text-muted-foreground hover:text-foreground",
          "transition-all duration-300 ease-in-out",
          "hover:-translate-x-1 focus:-translate-x-1",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded-md"
        )}
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
        back to work
      </Link>

      {/* Work Header */}
      <div className="mb-12 space-y-6">
        <div className="space-y-4">
          <HeadlineLarge text={item.title} showAsterisk href={item.href} />
          
          {/* Meta Information */}
          <div className={cn(
            "flex flex-wrap items-center gap-x-8 gap-y-2",
            "text-sm",
            "border-l-2 border-border/30 pl-4"
          )}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-highlight rounded-full animate-pulse" />
              <span className="text-muted-foreground">{item.role} • {item.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
              <span className="text-highlight font-medium">{item.tech}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {(item.description || !item.projects) && (
          <div className={cn(
            "space-y-4",
            "animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200"
          )}>
            <div className={cn(
              "prose prose-sm max-w-none",
              "text-muted-foreground leading-relaxed",
              "bg-gradient-to-br from-background/50 to-accent/5",
              "border border-border/20 rounded-lg p-6",
              "backdrop-blur-sm"
            )}>
              {item.description && <p>{item.description}</p>}
              {!item.projects && (
                <div className="mt-6 space-y-4">
                  <p className="text-muted-foreground/80 italic">
                    This work experience is still being documented. Check back soon for more details!
                  </p>
                  <ViewMore
                    title="explore other work"
                    href="/work"
                    subTitle={`(${work.length} experiences)`}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Projects Section */}
      {item.projects && (
        <div className={cn(
          "space-y-8",
          "animate-in fade-in-50 slide-in-from-bottom-8 duration-700 delay-400"
        )}>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
              Projects & Contributions
              <span className="text-sm text-muted-foreground font-normal">
                ({item.projects.length})
              </span>
            </h2>
          </div>

          <div className="space-y-12">
            {item.projects.map((project, index) => (
              <div
                key={index}
                className={cn(
                  "group relative",
                  "animate-in fade-in-50 slide-in-from-bottom-4 duration-500",
                  "hover:translate-x-2 transition-transform duration-300 ease-in-out"
                )}
                style={{ animationDelay: `${500 + index * 150}ms` }}
              >
                {/* Project Header */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex items-center justify-center",
                      "w-6 h-6 mt-1",
                      "bg-gradient-to-br from-highlight/20 to-accent/20",
                      "border border-border/30",
                      "rounded-full",
                      "transition-all duration-300",
                      "group-hover:scale-110 group-hover:rotate-12"
                    )}>
                      <span className="text-xs text-highlight font-bold">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <HeadlineSmall text={project.title} />
                    </div>
                  </div>

                  {/* App Store Links */}
                  {(project.playstore || project.appstore) && (
                    <div className="ml-9 flex flex-wrap gap-3">
                      {project.playstore && (
                        <MiniCard text="Google Play" href={project.playstore} />
                      )}
                      {project.appstore && (
                        <MiniCard text="App Store" href={project.appstore} />
                      )}
                    </div>
                  )}

                  {/* Features Built */}
                  {project.featuresBuilt && project.featuresBuilt.length > 0 && (
                    <div className="ml-9 space-y-3">
                      <h4 className="text-sm font-medium text-foreground/80 tracking-wide">
                        FEATURES BUILT
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.featuresBuilt.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="animate-in fade-in-50 slide-in-from-left-2 duration-300"
                            style={{ animationDelay: `${600 + index * 150 + featureIndex * 50}ms` }}
                          >
                            <MiniCard text={feature} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Points */}
                  {project.points && (
                    <div className="ml-9 space-y-3">
                      <div className="space-y-3">
                        {project.points.map((point, pointIndex) => (
                          <div
                            key={pointIndex}
                            className={cn(
                              "flex items-start gap-3 group/point",
                              "animate-in fade-in-50 slide-in-from-left-4 duration-400",
                              "hover:translate-x-1 transition-transform duration-200"
                            )}
                            style={{ animationDelay: `${700 + index * 150 + pointIndex * 100}ms` }}
                          >
                            <span className={cn(
                              "flex items-center justify-center",
                              "w-1.5 h-1.5 mt-2.5",
                              "bg-gradient-to-r from-highlight to-accent rounded-full",
                              "transition-all duration-300",
                              "group-hover/point:scale-150"
                            )} />
                            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtle separator line */}
                {index < item.projects!.length - 1 && (
                  <div className={cn(
                    "mt-12 h-px",
                    "bg-gradient-to-r from-transparent via-border/30 to-transparent",
                    "transition-all duration-300",
                    "group-hover:via-border/50"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
