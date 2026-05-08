import { projects } from "@/lib/constants/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { YouTubeVideo } from "@/components/video-component";
import { WebsitePreview } from "@/components/website-preview";
import { ProjectImages } from "./project-images";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const project = projects.find((p) => p.id === slug);
  if (!project) notFound();

  return (
    <main>
      <Link
        href="/projects"
        className="meta-tag hover-dim inline-flex items-center gap-1.5 mb-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
      >
        ← back
      </Link>

      <header className="mb-10 space-y-4">
        {project.website ? (
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            className="headline text-[clamp(22px,2.4vw,30px)] hover-dim inline-flex items-center gap-2"
          >
            {project.title}
            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
          </a>
        ) : (
          <h1 className="headline text-[clamp(22px,2.4vw,30px)]">
            {project.title}
          </h1>
        )}

        {project.subtitle && (
          <p className="text-[14px] font-light text-muted-foreground">
            {project.subtitle}
          </p>
        )}

        {project.description && (
          <p className="text-[14px] font-light leading-[1.6] text-muted-foreground">
            {project.description}
          </p>
        )}

        {project.tech && project.tech.length > 0 && (
          <p className="meta-tag">{project.tech.join(" · ")}</p>
        )}

        {(project.website || project.github || project.youtube) && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            {project.website && (
              <a
                href={project.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-dim inline-flex items-center gap-1 text-foreground"
              >
                website <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-dim inline-flex items-center gap-1 text-foreground"
              >
                github <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
            {project.youtube && (
              <a
                href={project.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-dim inline-flex items-center gap-1 text-foreground"
              >
                youtube <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </header>

      {project.highlights && project.highlights.length > 0 && (
        <section className="mb-10">
          <h2 className="section-label mb-5">highlights</h2>
          <ul className="space-y-3">
            {project.highlights.map((highlight, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[14px] font-light leading-[1.6] text-foreground"
              >
                <span className="select-none text-muted-foreground mt-[2px]">
                  —
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {project.website && project.id === "turi" && (
        <div className="mb-10">
          <WebsitePreview url={project.website} title={project.title} />
        </div>
      )}

      {project.youtube && (
        <div className="mb-10 rounded-lg overflow-hidden">
          <YouTubeVideo
            videoId={extractYouTubeVideoId(project.youtube)!}
            title={project.title}
          />
        </div>
      )}

      <ProjectImages project={project} />
    </main>
  );
}

function extractYouTubeVideoId(url: string): string | null {
  const youtubeUrlRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeUrlRegex);
  return match ? match[1] : "dQw4w9WgXcQ";
}
