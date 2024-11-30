import MiniCard from "@/components/mini-card";
import HeadlineLarge from "@/components/styles/headline-large";
import HeadlineSmall from "@/components/styles/headline-small";
import ViewMore from "@/components/view-more";
import { work } from "@/lib/constants/work";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const prms = await params;
  const slug = prms.slug;

  const item = work.find((item) => item.id === slug);

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
          <p className="text-highlight">{item.tech}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {!item.projects && (
            <>
              <div>
                <>
                  <p className="mt-4">{item.description}</p>
                </>
                <p className="mt-8 text-muted-foreground">
                  ooopsie this is still a work in progress look at others
                </p>
                <ViewMore
                  title="view more"
                  href={`/work`}
                  subTitle={`(${work.length})`}
                />
              </div>
            </>
          )}

          {item.projects && item.projects.length < 2 && (
            <>
              <p className="mt-4">{item.description}</p>
            </>
          )}

          {item.projects && (
            <>
              {item.projects!.map((project, index) => (
                <>
                  <div key={index} className="mt-8">
                    <div className="flex items-center gap-x-2">
                      <p className="text-foreground">{"=>"}</p>
                      <HeadlineSmall text={project.title} />
                    </div>

                    <div className=" mt-2 flex flex-wrap gap-x-4">
                      {project.playstore && (
                        <>
                          <MiniCard text="playstore" href={project.playstore} />
                        </>
                      )}
                      {project.appstore && (
                        <>
                          <MiniCard text="appstore" href={project.appstore} />
                        </>
                      )}
                    </div>

                    {project.featuresBuilt && (
                      <>
                        {project.featuresBuilt!.length > 0 && (
                          <p className="mt-6 mb-2 text-sm">
                            {"features built"}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-0 sm:gap-x-2">
                          {project.featuresBuilt!.map((feature, index) => (
                            <>
                              <MiniCard text={feature} key={index} />
                            </>
                          ))}
                        </div>
                      </>
                    )}
                    {project.points && (
                      <>
                        <ul className="list-disc list-inside mt-4">
                          {project.points!.map((point, index) => (
                            <li
                              key={index}
                              className="text-sm text-muted-foreground leading-7"
                            >
                              {point}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
