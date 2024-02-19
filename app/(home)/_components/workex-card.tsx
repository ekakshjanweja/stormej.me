import { Button } from "@/components/ui/button";
import Link from "next/link";

export const WorkExCard = () => {
  return (
    <div>
      <p></p>
      <div className="text-muted-foreground justify-start items-start p-2 flex flex-col leading-4 rounded-lg border-2 border-stone-100 dark:border-stone-800">
        <Link href={"/"} target="_blank">
          <Button
            variant="link"
            size="sm"
            className="text-md font-medium p-0 text-muted-foreground"
          >
            TBB
          </Button>

          <p className="text-sm mt-2">Test</p>
        </Link>
        <div className="flex items-center">
          {/* {project.github && (
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
          )} */}
        </div>
      </div>
    </div>
  );
};
