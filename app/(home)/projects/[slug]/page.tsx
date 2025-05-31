import MiniCard from "@/components/mini-card";
import HeadlineLarge from "@/components/styles/headline-large";
import { YouTubeVideo } from "@/components/video-component";
import { projects } from "@/lib/constants/projects";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Back Navigation */}
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 mb-12 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:gap-3"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
            <span className="relative">
              back to projects
              <span className="absolute inset-x-0 bottom-0 h-px bg-foreground/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </span>
          </Link>

          {/* Enhanced Project Header */}
          <div className="mb-16 p-8 rounded-2xl bg-muted/10 border border-border/30">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <HeadlineLarge text={item.title} showAsterisk href={item.href} />
                  
                  {/* Meta Information */}
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-highlight via-highlight/60 to-transparent rounded-full" />
                    <div className="text-sm pl-6">
                      <div className="text-muted-foreground font-medium">
                        {item.role && `${item.role} • `}{item.date}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-3">
                  {item.tech.split("-").map((tech, index) => (
                    <div 
                      key={index}
                      className="transform hover:scale-105 transition-all duration-200 hover:shadow-md"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <MiniCard text={tech} />
                    </div>
                  ))}
                </div>

                {/* Links */}
                {item.github && (
                  <div className="flex flex-wrap gap-4">                      <Link
                        href={item.github}
                        target="_blank"
                        className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-border/40 hover:border-highlight/50 transition-all duration-300 bg-background hover:-translate-y-0.5"
                      >                        <span>View on GitHub</span>
                        <span className="transform group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">↗</span>
                      </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Demo */}
          {item.youtube && (                <div className="group relative rounded-2xl overflow-hidden border border-border/40 hover:border-highlight/30 transition-all duration-500">
                  <YouTubeVideo
                    videoId={extractYouTubeVideoId(item.youtube)!}
                    title={item.title}
                  />
                </div>
          )}
        </div>
      </div>
    </main>
  );
}

function extractYouTubeVideoId(url: string): string | null {
  const youtubeUrlRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(youtubeUrlRegex);

  return match ? match[1] : "dQw4w9WgXcQ";
}
