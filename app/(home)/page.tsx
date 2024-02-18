import { Strongify } from "@/components/strongify";

const HomePage = () => {
  return (
    <>
      <div>
        <small>
          <p className="text-muted-foreground text-lg">
            Hey, I&#39;m
            <Strongify text={" Ekaksh Janweja"} />
            aka
            <Strongify text={"stormej."} />I am in my pre-final year in DTU
            studying engineering. I like building things and lifting weights
            (maybe some casual valorant too).
          </p>
        </small>
      </div>
    </>
  );
};

export default HomePage;
