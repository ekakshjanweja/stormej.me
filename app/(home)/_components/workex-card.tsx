"use client";

import { MousePointerClick } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WorkEx } from "@/lib/interfaces";
import Link from "next/link";
import { ProjectCard } from "./project-card";
import { useWindowSize } from "@/lib/window-size";

interface WorkExCardProps {
  workex: WorkEx;
}

export const WorkExCard = ({ workex }: WorkExCardProps) => {
  const currentScreenSize = useWindowSize();

  let isTooSmall;

  if (typeof window !== "undefined") {
    isTooSmall =
      currentScreenSize.width !== undefined && currentScreenSize.width < 768;
  }
  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="text-lg font-medium p-0 text-muted-foreground flex justify-between w-full pr-4">
              {workex.company}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-muted-foreground p-4 rounded-lg border-2 border-muted-foreground">
              <div className="flex items-center justify-between">
                <div className="gap-x-4 text-lg text-foreground flex justify-between items-center w-full">
                  <div className="flex gap-x-4 text-sm md:text-lg">
                    <p>{workex.role}</p>
                    <p>{workex.duration}</p>
                  </div>
                  <Link
                    href={workex.companyLink}
                    target="_blank"
                    className="text-sm flex font-medium text-muted-foreground gap-x-2 items-center hover:text-foreground border-2 py-1 px-2 rounded-lg"
                  >
                    <MousePointerClick className="h-4 w-4" />
                    {isTooSmall ? <p>Visit</p> : <p>Visit Website</p>}
                  </Link>
                </div>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
                {workex.projects.map((project) => (
                  <ProjectCard
                    project={project}
                    isBorder={false}
                    key={project.id}
                  />
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
