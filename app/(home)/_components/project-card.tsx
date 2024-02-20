"use client";

import { SVGIcon } from "@/components/svg-icon";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import GithubBlack from "../../../assets/logos/github_black.svg";
import GithubWhite from "../../../assets/logos/github_white.svg";
import YoutubeBlack from "../../../assets/logos/youtube_black.svg";
import YoutubeWhite from "../../../assets/logos/youtube_white.svg";
import PlaystoreBlack from "../../../assets/logos/playstore_black.svg";
import PlaystoreWhite from "../../../assets/logos/playstore_white.svg";
import { Projects } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { useWindowSize } from "@/lib/window-size";

interface ProjectCardProps {
  project: Projects;
  isBorder: boolean;
}

export const ProjectCard = ({ project, isBorder }: ProjectCardProps) => {
  const [description, setDescription] = useState(project.description);

  useEffect(() => {
    setDescription(description.substring(0, 70));
  }, [description]);

  const currentScreenSize = useWindowSize();

  let isTooSmall;

  if (typeof window !== "undefined") {
    isTooSmall =
      currentScreenSize.width !== undefined && currentScreenSize.width < 768;
  }

  return (
    <>
      <div
        className={cn(
          "text-muted-foreground justify-start items-start p-2 flex flex-col leading-4 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-950",
          isBorder ? "border-2 border-stone-100 dark:border-stone-800" : ""
        )}
      >
        <Link href={project.link || ""} target="_blank">
          <Button
            variant="link"
            size="sm"
            className="text-md font-medium p-0 text-muted-foreground"
          >
            {project.title}
          </Button>
          <p className="text-sm mt-2">{project.description}</p>
          {isTooSmall ? (
            <></>
          ) : (
            <p className="text-sm text-foreground mt-2">{project.techStack}</p>
          )}
        </Link>
        <div className="flex items-center">
          {project.github && (
            <SVGIcon
              href={project.github}
              iconDark={GithubWhite}
              iconLight={GithubBlack}
            />
          )}
          {project.playstore && (
            <div className="opacity-100">
              <SVGIcon
                href={project.playstore}
                iconDark={PlaystoreWhite}
                iconLight={PlaystoreBlack}
              />
            </div>
          )}
          {project.youtube && (
            <SVGIcon
              href={project.youtube}
              iconDark={YoutubeWhite}
              iconLight={YoutubeBlack}
            />
          )}
        </div>
      </div>
    </>
  );
};
