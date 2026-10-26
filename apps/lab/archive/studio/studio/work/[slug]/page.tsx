import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASES, caseFor, nextCase } from "@/lib/cases";
import { CaseChapters } from "../../_components/case-chapters";
import { CaseGallery } from "../../_components/case-gallery";
import {
	CaseFacts,
	CaseIntro,
	CaseLinks,
	CaseOutcomes,
} from "../../_components/case-sections";
import { NextCase } from "../../_components/next-case";
import { PageHero } from "../../_components/page-hero";
import { StudioLink } from "../../_components/studio-link";
import { casePosition, kindLabel, pad, WORK_GROUPS } from "../../_lib/pages";

/* one case study: the title in the fluid, the facts, the challenge, the
   numbers, the screens, the chapters, and the next case. every case is
   prerendered; anything else falls through to the studio's not-found */

interface CaseProps {
	params: Promise<{ slug: string }>;
}

export const generateStaticParams = () =>
	CASES.map((item) => ({ slug: item.slug }));

export async function generateMetadata({
	params,
}: CaseProps): Promise<Metadata> {
	const { slug } = await params;
	const item = caseFor(slug);
	if (!item) {
		return { title: "not found" };
	}
	return { description: item.challenge, title: item.title };
}

const previewFor = (slug: string) =>
	WORK_GROUPS.flatMap((group) => group.entries).find(
		(entry) => entry.slug === slug
	)?.image;

export default async function CasePage({ params }: CaseProps) {
	const { slug } = await params;
	const item = caseFor(slug);
	if (!item) {
		notFound();
	}
	const { index, total } = casePosition(item);
	const next = nextCase(item.slug);

	return (
		<article aria-labelledby="page-title" className="case">
			<PageHero
				className="is-case"
				eyebrow={
					<>
						<StudioLink href="/studio/work">work</StudioLink>
						<span aria-hidden="true">/</span>
						<span>{kindLabel(item)}</span>
						<span aria-hidden="true" className="page-hero-eyebrow-count">
							{pad(index)} / {pad(total)}
						</span>
					</>
				}
				foot={<CaseFacts item={item} />}
				title={item.title}
			>
				<p>{item.subtitle}</p>
			</PageHero>
			<CaseIntro item={item} />
			<CaseOutcomes item={item} />
			<CaseGallery item={item} />
			<CaseChapters chapters={item.chapters} />
			<CaseLinks item={item} />
			{next ? (
				<NextCase
					image={previewFor(next.slug)}
					index={casePosition(next).index}
					item={next}
					total={casePosition(next).total}
				/>
			) : null}
		</article>
	);
}
