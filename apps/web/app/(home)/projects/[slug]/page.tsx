import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";
import {
	CaseStudyHero,
	type HeroFact,
	type HeroLink,
} from "@/components/case-study/hero";
import { CaseStudyScreens } from "@/components/case-study-screens";
import { getMDXComponents } from "@/components/mdx";
import { SmoothScroll } from "@/components/smooth-scroll";
import { StoryLayout } from "@/components/story/story-layout";
import { YouTubeVideo } from "@/components/video-component";
import { VideoPlayer } from "@/components/video-player";
import { getProject, type ProjectFrontmatter } from "@/lib/projects";
import {
	buildBreadcrumbSchema,
	buildCreativeWorkSchema,
	jsonLd,
} from "@/lib/schema";
import { projectsSource } from "@/lib/source";

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
	// a few projects are frontmatter only: no story, just screens
	const hasBody = page.data.structuredData.contents.length > 0;
	const images = fm.images ?? [];
	const showGallery = !fm.inlineGallery && images.length > 0;

	// the demo: our own player for a self-hosted film, else the youtube embed
	const demo = fm.video ? (
		<VideoPlayer
			portrait={fm.videoOrientation === "portrait"}
			poster={fm.videoPoster}
			src={fm.video}
			title={fm.title}
		/>
	) : (
		fm.youtube && (
			<div className="overflow-hidden rounded-xl border border-border/60">
				<YouTubeVideo
					title={fm.title}
					videoId={extractYouTubeVideoId(fm.youtube)}
				/>
			</div>
		)
	);

	const schemas = [
		buildCreativeWorkSchema({
			about: fm.tech,
			description: fm.description ?? fm.subtitle,
			external: [fm.github, fm.youtube, fm.video].filter((s): s is string =>
				Boolean(s)
			),
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
			<SmoothScroll />
			<article className="relative">
				<StoryLayout
					intro={
						<CaseStudyHero
							backHref="/projects"
							facts={[
								{
									label: "what",
									value: [fm.kind, fm.year, fm.status]
										.filter(Boolean)
										.join(" · "),
								},
								fm.platform ? { label: "platform", value: fm.platform } : null,
								{ label: "stack", value: fm.tech.join(" · ") },
							].filter(
								(fact): fact is HeroFact =>
									fact !== null && fact.value.length > 0
							)}
							headline={fm.description ?? fm.subtitle}
							href={fm.website}
							links={[
								fm.github ? { href: fm.github, label: "github" } : null,
								fm.youtube
									? { href: fm.youtube, label: fm.video ? "youtube" : "demo" }
									: null,
							].filter((link): link is HeroLink => link !== null)}
							logo={fm.icon}
							name={fm.title}
							notes={fm.highlights}
							overview={fm.overview}
						>
							{demo}
						</CaseStudyHero>
					}
				>
					{hasBody && (
						<div className="prose-fuma story-flow">
							<MDX components={getMDXComponents()} />
						</div>
					)}
					{/* the screens the story didn't place inline close the right
					    column; with no story they are the right column */}
					{showGallery && (
						<CaseStudyScreens
							appendix={hasBody}
							images={images.map((image) => `/${image}`)}
							orientation={fm.imagesOrientation}
							sectionId="gallery"
							title={fm.title}
						/>
					)}
				</StoryLayout>
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
