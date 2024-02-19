import { ProjectCard } from "./project-card";

export interface Projects {
  id: number;
  title: string;
  description: string;
  link: string;
  github?: string;
  youtube?: string;
}

export const ProjectRow = () => {
  const projects: Projects[] = [
    {
      id: 3,
      title: "stormejislive",
      description:
        "A live streaming app made using nextjs-tailwind-livekit-postgres",
      link: "https://stormej.me",
      github: "https://github.com/ekakshjanweja/stormej-live",
      youtube: "https://www.youtube.com/watch?v=RAcWnMxSdTo&t=110s",
    },
    {
      id: 2,
      title: "dtusocial",
      description:
        "A proximity chat app made using flutter-firebase-riverpod-geolocator-mvc",
      link: "https://dtu.social",
      github: "https://github.com/ekakshjanweja/Google-Docs-Clone",
    },
    {
      id: 1,
      title: "gdocs",
      description:
        "A google docs clone made using flutter-firebase-riverpod-socketio-go",
      link: "https://stormej.me",
      github: "https://github.com/ekakshjanweja/Google-Docs-Clone",
      youtube: "https://www.youtube.com/watch?v=EKjbYMvR8xs",
    },
  ];
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
