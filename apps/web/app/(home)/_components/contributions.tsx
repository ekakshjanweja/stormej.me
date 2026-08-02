import {
	computeContributionStreaks,
	getGithubContributions,
} from "@/lib/contributions";
import { ContributionsGraphClient } from "./contributions-graph.client";

export const Contributions = async () => {
	const data = await getGithubContributions();
	const streaks = computeContributionStreaks(data.contributions);

	return (
		<section data-cursor-anchor="contributions">
			<div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
				<h2 className="section-label">activity</h2>
				<span
					aria-label={`Current streak ${streaks.current}, longest streak ${streaks.longest}`}
					className="meta-tag ml-auto shrink-0 text-muted-foreground/70 normal-case tracking-[0.06em] sm:ml-0"
					role="note"
				>
					🔥 {streaks.current.toLocaleString()} · 🏆{" "}
					{streaks.longest.toLocaleString()}
				</span>
			</div>
			<ContributionsGraphClient {...data} />
		</section>
	);
};
