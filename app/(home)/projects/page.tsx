import HeadlineLarge from "@/components/styles/headline-large";
import HeadlineMedium from "@/components/styles/headline-medium";
import ViewMore from "@/components/view-more";
import { projects } from "@/lib/constants/projects";
import Link from "next/link";

export default function Project() {
  return (
    <>
      <div>
        <HeadlineLarge text="projects" showAsterisk />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-4">
          {projects.map((item, index) => (
            <>
              <Link href={`/projects/${item.title}`}>
                <div key={index} className="flex flex-col gap-2 group">
                  <div className="flex items-center gap-x-2">
                    <p className="text-foreground">{"=>"}</p>
                    <HeadlineMedium text={item.title} />
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                    <p className="text-muted-foreground">
                      {item.role} {item.date}
                    </p>
                    <p className="text-muted-foreground">{item.tech}</p>
                    <p className="text-base opacity-80">{item.description}</p>
                  </div>

                  <ViewMore title="view more" />
                </div>
              </Link>
            </>
          ))}
        </div>
      </div>
    </>
  );
}
