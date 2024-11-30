"use client";

import MiniCard from "@/components/mini-card";
import HeadlineLarge from "@/components/styles/headline-large";
import { projects } from "@/lib/constants/projects";
import { notFound } from "next/navigation";
import YouTube from "react-youtube";

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
    <>
      <div>
        <HeadlineLarge text={item.title} showAsterisk href={item.href} />

        <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-muted-foreground my-2">
          <p>
            {item.role} {item.date}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.tech.split("-").map((tech, index) => (
            <>
              <MiniCard text={tech} key={index} />
            </>
          ))}
        </div>

        <div className="flex my-8">
          {item.youtube && (
            <YouTube videoId={extractYouTubeVideoId(item.youtube)} />
          )}
        </div>
      </div>
    </>
  );
}

function extractYouTubeVideoId(url: string): string | null {
  const youtubeUrlRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(youtubeUrlRegex);

  return match ? match[1] : null;
}
