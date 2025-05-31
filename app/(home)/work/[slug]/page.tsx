import MiniCard from "@/components/mini-card";
import HeadlineLarge from "@/components/styles/headline-large";
import HeadlineSmall from "@/components/styles/headline-small";
import ViewMore from "@/components/view-more";
import { work } from "@/lib/constants/work";
import { notFound } from "next/navigation";
import Link from "next/link";

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
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Back Navigation */}
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 mb-12 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:gap-3"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
            <span className="relative">
              back to work
              <span className="absolute inset-x-0 bottom-0 h-px bg-foreground/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </span>
          </Link>

          {/* Enhanced Work Header */}
          <div className="mb-16 p-8 rounded-2xl bg-muted/10 border border-border/30">
            <div className="space-y-8">
              <div className="space-y-6">
                <HeadlineLarge text={item.title} showAsterisk href={item.href} />
                
                {/* Enhanced Meta Information */}
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-highlight via-highlight/60 to-transparent rounded-full" />
                  <div className="text-sm pl-6 space-y-3">
                    <div className="text-muted-foreground font-medium">{item.role} • {item.date}</div>
                    <div className="text-highlight font-semibold px-3 py-1 rounded-full bg-highlight/10 border border-highlight/20 inline-block">
                      {item.tech}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Description */}
              {(item.description || !item.projects) && (
                <div className="space-y-4">
                  <div className="relative p-6 rounded-xl bg-muted/5 border border-border/20">
                    <div className="absolute top-4 left-4 w-2 h-2 bg-highlight/60 rounded-full animate-pulse" />
                    <div className="pl-6">
                      {item.description && (
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      )}
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
                </div>
              )}
            </div>
          </div>

          {/* Projects Section */}
          {item.projects && (
            <div className="space-y-8">
              {item.projects.map((project, index) => (
                <div 
                  key={index} 
                  className="group relative p-6 rounded-xl bg-muted/5 border border-border/20 hover:border-highlight/30 transition-all duration-500"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Project Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative flex items-center justify-center w-8 h-8 mt-1">
                      <div className="absolute inset-0 bg-highlight/10 rounded-full" />
                      <div className="relative flex items-center justify-center w-6 h-6 border border-highlight/40 rounded-full bg-background">
                        <span className="text-xs text-highlight font-bold">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <HeadlineSmall text={project.title} />
                    </div>
                  </div>

                  {/* App Store Links */}
                  {(project.playstore || project.appstore) && (
                    <div className="ml-12 mb-6 flex flex-wrap gap-3">
                      {project.playstore && (
                        <div className="transform hover:scale-105 transition-all duration-200">
                          <MiniCard text="Google Play" href={project.playstore} />
                        </div>
                      )}
                      {project.appstore && (
                        <div className="transform hover:scale-105 transition-all duration-200">
                          <MiniCard text="App Store" href={project.appstore} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Features Built */}
                  {project.featuresBuilt && project.featuresBuilt.length > 0 && (
                    <div className="ml-12 mb-6">
                      <div className="flex flex-wrap gap-2">
                        {project.featuresBuilt.map((feature, featureIndex) => (
                          <div 
                            key={featureIndex}
                            className="transform hover:scale-105 transition-all duration-200"
                            style={{ animationDelay: `${featureIndex * 50}ms` }}
                          >
                            <MiniCard text={feature} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Points */}
                  {project.points && (
                    <div className="ml-12 space-y-4">
                      <div className="space-y-4">
                        {project.points.map((point, pointIndex) => (
                          <div 
                            key={pointIndex} 
                            className="flex items-start gap-4 group/point"
                            style={{ animationDelay: `${pointIndex * 100}ms` }}
                          >
                            <span className="w-2 h-2 mt-2.5 bg-highlight rounded-full group-hover/point:scale-125 transition-transform duration-200" />
                            <p className="text-sm text-muted-foreground leading-relaxed flex-1 group-hover/point:text-foreground/80 transition-colors duration-200">
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Separator */}
                  {index < item.projects!.length - 1 && (
                    <div className="mt-8 h-px bg-border/30" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
