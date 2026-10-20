import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";
import {
	CaseStudyHero,
	type HeroFact,
	type HeroLink,
} from "@/components/case-study/hero";
import { StoryIndex, tocItems } from "@/components/case-study/story-index";
import { HuggingFaceChip } from "@/components/hugging-face-chip";
import { getMDXComponents } from "@/components/mdx";
import { SmoothScroll } from "@/components/smooth-scroll";
import { StoryLayout } from "@/components/story/story-layout";
import {
	fetchHuggingFaceStats,
	type HuggingFaceRepoRef,
} from "@/lib/huggingface";
import { publicationsSource } from "@/lib/source";

interface PageProps {
	params: Promise<{ slug: string }>;
}

interface PublicationData {
	arxivId?: string;
	arxivUrl?: string;
	authors?: string[];
	date?: string;
	description?: string;
	doi?: string;
	huggingface?: HuggingFaceRepoRef[];
	pdfUrl?: string;
	title: string;
	venue?: string;
}

const resolveArxivUrl = (arxivId?: string, arxivUrl?: string) => {
	if (arxivUrl) {
		return arxivUrl;
	}
	if (arxivId) {
		return `https://arxiv.org/abs/${arxivId}`;
	}
};

export async function generateStaticParams() {
	return publicationsSource.generateParams().map(({ slug }) => ({
		slug: slug?.[0] ?? "",
	}));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const page = publicationsSource.getPage([slug]);
	if (!page) {
		notFound();
	}

	const { title, description, date } = page.data as PublicationData;

	const canonical = `/publications/${slug}`;

	return {
		alternates: { canonical },
		description,
		openGraph: {
			description,
			publishedTime: date,
			title,
			type: "article",
			url: canonical,
		},
		title,
		twitter: {
			description,
			title,
		},
	};
}

export default async function Page({ params }: PageProps) {
	const { slug } = await params;
	const page = publicationsSource.getPage([slug]);
	if (!page) {
		notFound();
	}

	const data = page.data as PublicationData;
	const MDX = page.data.body;

	const dateText = data.date
		? new Date(data.date).toLocaleDateString("en-US", {
				day: "numeric",
				month: "long",
				year: "numeric",
			})
		: null;

	const arxivUrl = resolveArxivUrl(data.arxivId, data.arxivUrl);
	const authors = data.authors ?? [];
	const hfRepos = await fetchHuggingFaceStats(data.huggingface);

	return (
		<main>
			<ContentViewTracker kind="publication" slug={slug} title={data.title} />
			<SmoothScroll />
			<StoryLayout
				aside={<StoryIndex items={tocItems(page.data.toc)} />}
				intro={
					<CaseStudyHero
						backHref="/publications"
						description={authors.length > 0 ? authors.join(", ") : undefined}
						facts={[
							data.venue ? { label: "venue", value: data.venue } : null,
							dateText ? { label: "published", value: dateText } : null,
						].filter((fact): fact is HeroFact => fact !== null)}
						headline={data.title}
						links={[
							arxivUrl
								? {
										href: arxivUrl,
										label: data.arxivId ? `arxiv:${data.arxivId}` : "arxiv",
									}
								: null,
							data.pdfUrl ? { href: data.pdfUrl, label: "pdf" } : null,
							data.doi
								? { href: `https://doi.org/${data.doi}`, label: "doi" }
								: null,
						].filter((link): link is HeroLink => link !== null)}
						name="publication"
					>
						{hfRepos.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{hfRepos.map((repo) => (
									<HuggingFaceChip
										downloads={repo.downloads}
										key={repo.url}
										label={repo.label ?? repo.id}
										type={repo.type}
										url={repo.url}
									/>
								))}
							</div>
						)}
					</CaseStudyHero>
				}
			>
				<article className="prose-fuma story-flow">
					<MDX
						components={getMDXComponents({
							a: createRelativeLink(publicationsSource, page),
						})}
					/>
				</article>
			</StoryLayout>
		</main>
	);
}
