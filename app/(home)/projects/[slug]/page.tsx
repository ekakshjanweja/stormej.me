import { projects } from "@/lib/constants/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YouTubeVideo } from "@/components/video-component";
import { WebsitePreview } from "@/components/website-preview";
import { ProjectImages } from "./project-images";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const project = projects.find((project) => project.id === slug);

  if (project === undefined) {
    notFound();
  }

  return (
    <main>
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <Link
          href="/projects"
          className="group inline-flex items-center gap-2 mb-12 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:gap-3"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
            ←
          </span>
          <span className="relative">
            back to projects
            <span className="absolute inset-x-0 bottom-0 h-px bg-foreground/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </span>
        </Link>

        {/* Project Header */}
        <div className="mb-12">
          <div className="space-y-4">
            {/* 1. Title + Website */}
            <div className="flex items-center gap-2">
              {project.website ? (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  <p className="text-lg md:text-xl font-semibold tracking-tight group-hover:text-primary transition-colors duration-200">
                    {project.title}
                  </p>
                </a>
              ) : (
                <p className="text-lg md:text-xl font-semibold tracking-tight">
                  {project.title}
                </p>
              )}
            </div>

            {/* 2. Subtitle */}
            <div className="text-xs md:text-sm text-muted-foreground font-medium">
              {project.subtitle}
            </div>

            {/* 3. Description */}
            {project.description && (
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            )}

            {/* 4. Tech Stack */}
            <div className="flex flex-wrap gap-1 mb-3">
              {project.tech.map((tech, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-md bg-muted/50 text-muted-foreground/70 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* 4.5. External Links */}
            {(project.website || project.github || project.youtube) && (
              <div className="flex flex-wrap gap-2">
                {project.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
                {project.github && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      github
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
                {project.youtube && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={project.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      youtube
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 5. Highlights */}
        {project.highlights && project.highlights.length > 0 && (
          <div className="mb-6">
            <div className="space-y-2.5">
              {project.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 mt-1.5 bg-muted-foreground/60 rounded-full flex-shrink-0" />
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Website Preview */}
        {project.website && project.id === "turi" && (
          <div className="mb-8">
            <WebsitePreview url={project.website} title={project.title} />
          </div>
        )}

        {/* 7. YouTube Video */}
        {project.youtube && (
          <div className="mb-8 group relative rounded-2xl overflow-hidden border border-border/40 hover:border-highlight/30 transition-all duration-500">
            <YouTubeVideo
              videoId={extractYouTubeVideoId(project.youtube)!}
              title={project.title}
            />
          </div>
        )}

        {/* 8. Project Images */}
        <ProjectImages project={project} />
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
