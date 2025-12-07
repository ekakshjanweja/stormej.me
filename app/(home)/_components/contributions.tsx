import { getGithubContributions } from "@/lib/contributions";
import { ContributionsGraphClient } from "./contributions-graph.client";

export const Contributions = async () => {
  const { contributions, total, year } = await getGithubContributions();

  return (
    <section data-cursor-anchor="contributions">
      <ContributionsGraphClient
        data={contributions}
        total={total}
        year={year}
      />
    </section>
  );
};
