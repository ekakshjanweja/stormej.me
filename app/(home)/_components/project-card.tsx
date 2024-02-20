"use client";

import { SVGIcon } from "@/components/svg-icon";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import GithubBlack from "../../../assets/logos/github_black.svg";
import GithubWhite from "../../../assets/logos/github_white.svg";
import YoutubeBlack from "../../../assets/logos/youtube_black.svg";
import YoutubeWhite from "../../../assets/logos/youtube_white.svg";
import { Projects } from "@/lib/interfaces";

interface ProjectCardProps {
  project: Projects;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const [description, setDescription] = useState(project.description);

  useEffect(() => {
    setDescription(description.substring(0, 70));
  }, [description]);

  return (
    <>
      <div className="text-muted-foreground justify-start items-start p-2 flex flex-col leading-4 rounded-lg border-2 border-stone-100 dark:border-stone-800">
        <Link href={project.link} target="_blank">
          <Button
            variant="link"
            size="sm"
            className="text-md font-medium p-0 text-muted-foreground"
          >
            {project.title}
          </Button>

          <p className="text-sm mt-2">{project.description}</p>
        </Link>
        <div className="flex items-center">
          {project.github && (
            <SVGIcon
              href={project.github}
              iconDark={GithubWhite}
              iconLight={GithubBlack}
            />
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
