import MiniCard from "@/components/mini-card";
import HeadlineLarge from "@/components/styles/headline-large";
import { YouTubeVideo } from "@/components/video-component";
import { projects } from "@/lib/constants/projects";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const slug = (await params).slug;

  const item = projects.find((item) => item.title === slug);

  if (item === undefined) {
    notFound();
  }

  return (
    <div className="relative min-h-screen">
      {/* Minimal Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-highlight/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-bl from-accent/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-tr from-primary/2 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Back Navigation */}
      <Link
        href="/projects"
        className={cn(
          "group inline-flex items-center gap-2 mb-8",
          "text-sm text-muted-foreground hover:text-foreground",
          "transition-all duration-300 ease-in-out",
          "hover:-translate-x-1 focus:-translate-x-1",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded-md"
        )}
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
        back to projects
      </Link>

      {/* Project Header */}
      <div className="mb-12 space-y-6">
        <div className="space-y-4">
          <HeadlineLarge text={item.title} showAsterisk href={item.href} />
          
          {/* Meta Information */}
          <div className={cn(
            "flex flex-wrap items-center gap-x-8 gap-y-2",
            "text-sm text-muted-foreground",
            "border-l-2 border-border/30 pl-4"
          )}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-highlight rounded-full animate-pulse" />
              <span>{item.role && `${item.role} • `}{item.date}</span>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground/80 tracking-wide uppercase">
            Tech Stack
          </h3>
          <div className={cn(
            "flex flex-wrap gap-2",
            "animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200"
          )}>
            {item.tech.split("-").map((tech, index) => (
              <div
                key={index}
                className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <MiniCard text={tech} />
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        {item.github && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/80 tracking-wide uppercase">
              Links
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link
                href={item.github}
                target="_blank"
                className={cn(
                  "group inline-flex items-center gap-2",
                  "px-4 py-2 rounded-lg",
                  "text-sm text-muted-foreground hover:text-foreground",
                  "border border-border/30 hover:border-border/60",
                  "bg-background/50 hover:bg-accent/20",
                  "transition-all duration-300 ease-in-out",
                  "hover:scale-105 hover:-translate-y-0.5",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                )}
              >
                <span>View on GitHub</span>
                <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Project Demo */}
      {item.youtube && (
        <div className={cn(
          "space-y-6",
          "animate-in fade-in-50 slide-in-from-bottom-8 duration-700 delay-500"
        )}>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground/80 tracking-wide uppercase">
              Demo
            </h3>
            <div className={cn(
              "relative group",
              "rounded-xl overflow-hidden",
              "border border-border/30",
              "bg-gradient-to-br from-background/50 to-accent/10",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-500 ease-in-out",
              "hover:scale-[1.02] hover:-translate-y-1"
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-highlight/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 p-2">
                <YouTubeVideo
                  videoId={extractYouTubeVideoId(item.youtube)!}
                  title={item.title}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function extractYouTubeVideoId(url: string): string | null {
  const youtubeUrlRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(youtubeUrlRegex);

  return match ? match[1] : "dQw4w9WgXcQ";
}
