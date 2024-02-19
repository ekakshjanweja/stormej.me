import { Strongify } from "@/components/strongify";
import { ProjectCard } from "../_components/project-card";
import { ProjectRow } from "../_components/project-row";
import { WorkExRow } from "../_components/workex-row";

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
    </>
  );
};

export default HomePage;
