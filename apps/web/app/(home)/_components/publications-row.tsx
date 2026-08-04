import { listPublications, withHuggingFaceDownloads } from "@/lib/publication";
import { PublicationsRowList } from "./publications-row-list";

const HOME_LIMIT = 2;

export const PublicationsRow = async () => {
	const publications = listPublications();
	if (publications.length === 0) {
		return null;
	}

	// only the rows that render get their download counts fetched
	const shown = await withHuggingFaceDownloads(
		publications.slice(0, HOME_LIMIT)
	);

	return (
		<PublicationsRowList
			publications={shown}
			showViewAll={publications.length > HOME_LIMIT}
		/>
	);
};
