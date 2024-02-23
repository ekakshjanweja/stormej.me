import { openSourceAndCommunityWork } from "@/lib/open-source-community-work";
import { ProjectCard } from "./project-card";

export const OpenSourceAndCommunityWorkRow = () => {
  return (
    <>
      <div>
        <div className="font-semibold text-lg mt-8">
          Open Source And Community Work
        </div>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {openSourceAndCommunityWork.map((project) => (
            <ProjectCard key={project.id} project={project} isBorder={false} />
          ))}
        </div>
      </div>
    </>
  );
};
