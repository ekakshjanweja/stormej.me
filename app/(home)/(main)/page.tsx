import { Strongify } from "@/components/strongify";
import { ProjectRow } from "../_components/project-row";
import { WorkExRow } from "../_components/workex-row";
import { OpenSourceAndCommunityWorkRow } from "../_components/open-source-community-work-row";
import Link from "next/link";
import { Spotlight } from "@/components/ui/spotlight";

const HomePage = () => {
  return (
    <>
      {/* <Spotlight className="-top-40 md:-top-96" fill="#e7e5e4" /> */}
      <div>
        <p className="text-muted-foreground text-lg">
          Hello, I&#39;m
          <Strongify text={" Ekaksh Janweja"} />
          aka
          <Strongify text={"stormej."} />I am in my pre-final year in DTU
          studying engineering. I like
          <Strongify text={" building things "} />
          and
          <Strongify text={" lifting weights "} />
          (maybe some casual
          <Strongify text={" valorant "} />
          too).
        </p>
      </div>
      <WorkExRow />
      <ProjectRow />
      <OpenSourceAndCommunityWorkRow />
    </>
  );
};

export default HomePage;
