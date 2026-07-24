import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";
import { getMDXComponents } from "@/components/mdx";
import { LinkPreview } from "@/components/ui/link-preview";
import { YouTubeVideo } from "@/components/video-component";
import { getProject, type ProjectFrontmatter } from "@/lib/projects";
import {
	buildBreadcrumbSchema,
	buildCreativeWorkSchema,
	jsonLd,
} from "@/lib/schema";
import { projectsSource } from "@/lib/source";
import { ProjectImages } from "./project-images";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	return projectsSource.generateParams().map(({ slug }) => ({
		slug: slug?.[0] ?? "",
	}));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const page = getProject(slug);
	if (!page) {
		notFound();
	}
	const fm = page.data as ProjectFrontmatter;

	const description = fm.description ?? fm.subtitle;
	const canonical = `/projects/${slug}`;
	const ogImage = `/og/projects/${slug}`;

	return {
		alternates: { canonical },
		description,
		openGraph: {
			description,
			images: [{ alt: fm.title, height: 630, url: ogImage, width: 1200 }],
			title: fm.title,
			type: "article",
			url: canonical,
		},
		title: fm.title,
		twitter: {
			description,
			images: [ogImage],
			title: fm.title,
		},
	};
}

export default async function Page({ params }: PageProps) {
	const { slug } = await params;
	const page = getProject(slug);
	if (!page) {
		notFound();
	}

	const fm = page.data as ProjectFrontmatter;
	const MDX = page.data.body;

	const schemas = [
		buildCreativeWorkSchema({
			about: fm.tech,
			description: fm.description ?? fm.subtitle,
			external: [fm.github, fm.youtube].filter((s): s is string => Boolean(s)),
			kind: "projects",
			slug,
			title: fm.title,
			website: fm.website,
		}),
		buildBreadcrumbSchema([
			{ name: "home", url: "/" },
			{ name: "projects", url: "/projects" },
			{ name: fm.title, url: `/projects/${slug}` },
		]),
	];

	return (
		<main>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: json-ld is serialised by jsonLd(); next has no other way to emit structured data
				dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }}
				type="application/ld+json"
			/>
			<ContentViewTracker kind="project" slug={slug} title={fm.title} />
			<Link
				className="meta-tag hover-dim mb-12 inline-flex items-center gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				href="/projects"
			>
				← back
			</Link>

			<header className="mb-10 space-y-4">
				{fm.website ? (
					<h1 className="headline m-0 text-[clamp(22px,2.4vw,30px)]">
						<LinkPreview
							className="inline-flex min-w-0 items-center gap-2 font-serif italic"
							url={fm.website}
						>
							<span className="squiggle-link min-w-0 [overflow-wrap:anywhere]">
								{fm.title}
							</span>
							<ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
						</LinkPreview>
					</h1>
				) : (
					<h1 className="headline text-[clamp(22px,2.4vw,30px)]">{fm.title}</h1>
				)}

				{fm.subtitle && (
					<p className="font-light text-[14px] text-muted-foreground">
						{fm.subtitle}
					</p>
				)}

				{fm.description && (
					<p className="font-light text-[14px] text-muted-foreground leading-[1.6]">
						{fm.description}
					</p>
				)}

				{fm.tech.length > 0 && (
					<p className="meta-tag">{fm.tech.join(" · ")}</p>
				)}

				{(fm.website || fm.github || fm.youtube) && (
					<div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
						{fm.website && (
							<a
								className="hover-dim inline-flex items-center gap-1 text-foreground"
								href={fm.website}
								rel="noopener noreferrer"
								target="_blank"
							>
								website <ArrowUpRight className="h-3 w-3" />
							</a>
						)}
						{fm.github && (
							<a
								className="hover-dim inline-flex items-center gap-1 text-foreground"
								href={fm.github}
								rel="noopener noreferrer"
								target="_blank"
							>
								github <ArrowUpRight className="h-3 w-3" />
							</a>
						)}
						{fm.youtube && (
							<a
								className="hover-dim inline-flex items-center gap-1 text-foreground"
								href={fm.youtube}
								rel="noopener noreferrer"
								target="_blank"
							>
								youtube <ArrowUpRight className="h-3 w-3" />
							</a>
						)}
					</div>
				)}
			</header>

			{fm.youtube && (
				<div className="mb-10 overflow-hidden rounded-lg">
					<YouTubeVideo
						title={fm.title}
						videoId={extractYouTubeVideoId(fm.youtube)}
					/>
				</div>
			)}

			{!fm.inlineGallery && (
				<ProjectImages images={fm.images} title={fm.title} />
			)}

			<article className="prose-fuma mt-10">
				<MDX components={getMDXComponents()} />
			</article>
		</main>
	);
}

const YOUTUBE_URL =
	/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function extractYouTubeVideoId(url: string): string {
	const match = url.match(YOUTUBE_URL);
	return match ? match[1] : "dQw4w9WgXcQ";
}
