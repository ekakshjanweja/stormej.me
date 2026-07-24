import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";
import { getMDXComponents } from "@/components/mdx";
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
				dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }}
				type="application/ld+json"
			/>
			<ContentViewTracker kind="trove" slug={slug} title={data.title} />
			<Link
				className="meta-tag hover-dim mb-12 inline-flex items-center gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				href="/trove"
			>
				← back
			</Link>

			<header className="mb-10 space-y-4">
				<h1 className="headline text-balance text-[clamp(24px,2.8vw,36px)]">
					{data.title}
				</h1>
				{meta && <p className="meta-tag">{meta}</p>}
				{data.description && (
					<p className="text-pretty font-light text-[14px] text-muted-foreground leading-[1.6]">
						{data.description}
					</p>
				)}
				<AgentSetup
					slug={slug}
					sourceFile={data.sourceFile}
					title={data.title}
				/>
			</header>

			<article className="prose-fuma">
				<MDX
					components={getMDXComponents({
						a: createRelativeLink(troveSource, page),
					})}
				/>
			</article>
		</main>
	);
}
