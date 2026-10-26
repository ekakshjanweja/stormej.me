import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECT_CASES, caseFor, nextCase } from "@/lib/cases";
import { CasePage } from "../../_components/case-page";
import { Shell } from "../../_components/shell";
import { caseMarkdown } from "../../_lib/markdown";

interface Props {
	params: Promise<{ slug: string }>;
}

/* every case is prerendered; any other slug is a 404 */
export const dynamicParams = false;

export const generateStaticParams = () =>
	PROJECT_CASES.map((item) => ({ slug: item.slug }));

const find = (slug: string) => {
	const item = caseFor(slug);
	return item?.kind === "project" ? item : undefined;
};

export const generateMetadata = async ({
	params,
}: Props): Promise<Metadata> => {
	const item = find((await params).slug);
	if (!item) {
		return { title: "not found · ekaksh janweja · orbit" };
	}
	return {
		description: `${item.subtitle}. ${item.challenge}`,
		title: `${item.title} · build · ekaksh janweja · orbit`,
	};
};

export default async function BuildCasePage({ params }: Props) {
	const { slug } = await params;
	const item = find(slug);
	if (!item) {
		notFound();
	}
	const next = nextCase(slug);
	return (
		<Shell markdown={caseMarkdown(item, next)}>
			<CasePage
				item={item}
				next={next}
				position={PROJECT_CASES.indexOf(item) + 1}
				total={PROJECT_CASES.length}
			/>
		</Shell>
	);
}
