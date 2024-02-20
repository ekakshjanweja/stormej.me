import { Strongify } from "@/components/strongify";
import { ProjectRow } from "../_components/project-row";
import { WorkExRow } from "../_components/workex-row";
import { OpenSourceAndCommunityWorkRow } from "../_components/open-source-community-work-row";

const HomePage = () => {
  return (
    <>
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
