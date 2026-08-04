import { HuggingFaceChip } from "@/components/hugging-face-chip";
import {
	fetchHuggingFaceStats,
	type HuggingFaceRepoType,
} from "@/lib/huggingface";

interface HuggingFaceStatProps {
	/** repo id, e.g. fpvlabs/stera-10m */
	id: string;
	type?: HuggingFaceRepoType;
}

/**
 * live download count for a hugging face repo, usable from any mdx page.
 * async server component, so the fetch never reaches the client.
 */
export async function HuggingFaceStat({
	id,
	type = "dataset",
}: HuggingFaceStatProps) {
	const [stats] = await fetchHuggingFaceStats([{ id, type }]);

	if (!stats) {
		return null;
	}

	return (
		<HuggingFaceChip
			compact
			downloads={stats.downloads}
			label={id}
			type={stats.type}
			url={stats.url}
		/>
	);
}
