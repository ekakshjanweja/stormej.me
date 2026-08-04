import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";
import { HuggingFaceChip } from "@/components/hugging-face-chip";
import { getMDXComponents } from "@/components/mdx";
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
			<Link
				className="meta-tag hover-dim mb-12 inline-flex items-center gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				href="/publications"
			>
				← back
			</Link>

			<header className="mb-10 space-y-4">
				<h1 className="headline text-[clamp(24px,2.8vw,36px)]">{data.title}</h1>
				{authors.length > 0 && (
					<p className="font-light text-[13px] text-muted-foreground leading-snug">
						{authors.join(", ")}
					</p>
				)}
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
					{data.venue && <span className="meta-tag">{data.venue}</span>}
					{dateText && <span className="meta-tag">{dateText}</span>}
					{arxivUrl && (
						<a
							className="meta-tag hover-dim underline-offset-4 hover:underline"
							href={arxivUrl}
							rel="noreferrer"
							target="_blank"
						>
							arxiv{data.arxivId ? `:${data.arxivId}` : ""}
						</a>
					)}
					{data.pdfUrl && (
						<a
							className="meta-tag hover-dim underline-offset-4 hover:underline"
							href={data.pdfUrl}
							rel="noreferrer"
							target="_blank"
						>
							pdf
						</a>
					)}
					{data.doi && (
						<a
							className="meta-tag hover-dim underline-offset-4 hover:underline"
							href={`https://doi.org/${data.doi}`}
							rel="noreferrer"
							target="_blank"
						>
							doi
						</a>
					)}
					{hfRepos.map((repo) => (
						<HuggingFaceChip
							downloads={repo.downloads}
							key={repo.url}
							label={repo.label ?? repo.id}
							url={repo.url}
						/>
					))}
				</div>
				{data.description && (
					<p className="font-light text-[14px] text-muted-foreground leading-[1.6]">
						{data.description}
					</p>
				)}
			</header>

			<article className="prose-fuma">
				<MDX
					components={getMDXComponents({
						a: createRelativeLink(publicationsSource, page),
					})}
				/>
			</article>
		</main>
	);
}
