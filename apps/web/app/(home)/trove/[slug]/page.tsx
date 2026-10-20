import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";
import { CaseStudyHero } from "@/components/case-study/hero";
import { StoryIndex, tocItems } from "@/components/case-study/story-index";
import { getMDXComponents } from "@/components/mdx";
import { SmoothScroll } from "@/components/smooth-scroll";
import { StoryLayout } from "@/components/story/story-layout";
import { AgentSetup } from "@/components/trove/agent-setup";
import {
	buildBreadcrumbSchema,
	buildCreativeWorkSchema,
	jsonLd,
} from "@/lib/schema";
import { troveSource } from "@/lib/source";
import { isTroveSlugEnabled } from "@/lib/trove-config";

interface PageProps {
	params: Promise<{ slug: string }>;
}

interface TroveData {
	date?: string;
	description?: string;
	github?: string;
	sourceFile?: string;
	subtitle?: string;
	tech?: string[];
	title: string;
}

export async function generateStaticParams() {
	return troveSource
		.generateParams()
		.map(({ slug }) => ({ slug: slug?.[0] ?? "" }))
		.filter(({ slug }) => isTroveSlugEnabled(slug));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const page = troveSource.getPage([slug]);
	if (!(page && isTroveSlugEnabled(slug))) {
		notFound();
	}

	const { title, description } = page.data as TroveData;

	const canonical = `/trove/${slug}`;
	const ogImage = `/og/trove/${slug}`;

	return {
		alternates: { canonical },
		description,
		openGraph: {
			description,
			images: [{ alt: title, height: 630, url: ogImage, width: 1200 }],
			title,
			type: "article",
			url: canonical,
		},
		title,
		twitter: {
			description,
			images: [ogImage],
			title,
		},
	};
}

export default async function Page({ params }: PageProps) {
	const { slug } = await params;
	const page = troveSource.getPage([slug]);
	if (!(page && isTroveSlugEnabled(slug))) {
		notFound();
	}

	const MDX = page.data.body;
	const data = page.data as TroveData;

	const meta = [data.sourceFile, ...(data.tech ?? [])]
		.filter(Boolean)
		.join(" · ");

	const schemas = [
		buildCreativeWorkSchema({
			about: data.tech,
			description: data.description,
			external: data.github ? [data.github] : undefined,
			kind: "trove",
			slug,
			startDate: data.date,
			title: data.title,
		}),
		buildBreadcrumbSchema([
			{ name: "home", url: "/" },
			{ name: "trove", url: "/trove" },
			{ name: data.title, url: `/trove/${slug}` },
		]),
	];

	return (
		<main>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: json-ld is serialised by jsonLd(); next has no other way to emit structured data
				dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }}
				type="application/ld+json"
			/>
			<ContentViewTracker kind="trove" slug={slug} title={data.title} />
			<SmoothScroll />
			<StoryLayout
				aside={<StoryIndex items={tocItems(page.data.toc)} />}
				intro={
					<CaseStudyHero
						backHref="/trove"
						description={data.description}
						facts={meta ? [{ label: "source", value: meta }] : []}
						headline={data.title}
						links={data.github ? [{ href: data.github, label: "github" }] : []}
						name="trove"
					>
						<AgentSetup slug={slug} title={data.title} />
					</CaseStudyHero>
				}
			>
				<article className="prose-fuma story-flow">
					<MDX
						components={getMDXComponents({
							a: createRelativeLink(troveSource, page),
						})}
					/>
				</article>
			</StoryLayout>
		</main>
	);
}
