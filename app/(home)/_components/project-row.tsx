import { ProjectCard } from "./project-card";
import { projects } from "@/lib/projects";

export const ProjectRow = () => {
  return (
    <>
      <div>
        <div className="font-semibold text-lg mt-16">Projects</div>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </>
  );
};
