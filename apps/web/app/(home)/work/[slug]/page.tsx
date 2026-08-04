import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";
import { getMDXComponents } from "@/components/mdx";
import { Chapter } from "@/components/mdx/chapter";
import { Figure } from "@/components/mdx/figure";
import { Gallery } from "@/components/mdx/gallery";
import { Screens } from "@/components/mdx/screens";
import {
	WorkCaseStudyHeader,
	WorkDefaultHeader,
} from "@/components/work/header";
import {
	buildBreadcrumbSchema,
	buildCreativeWorkSchema,
	jsonLd,
} from "@/lib/schema";
import { workSource } from "@/lib/source";
import { getWork, type WorkFrontmatter } from "@/lib/work";

function formatRange(start: Date, end?: Date | null) {
	const fmt = (d: Date) =>
		d
			.toLocaleString("default", { month: "short", year: "numeric" })
			.toLowerCase();
	return `${fmt(start)} to ${end ? fmt(end) : "present"}`;
}

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	return workSource.generateParams().map(({ slug }) => ({
		slug: slug?.[0] ?? "",
	}));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const page = getWork(slug);
	if (!page) {
		notFound();
	}
	const fm = page.data as WorkFrontmatter;

	const canonical = `/work/${slug}`;
	const ogImage = `/og/work/${slug}`;

	return {
		alternates: { canonical },
		description: fm.description,
		openGraph: {
			description: fm.description,
			images: [{ alt: fm.title, height: 630, url: ogImage, width: 1200 }],
			title: fm.title,
			type: "article",
			url: canonical,
		},
		title: fm.title,
		twitter: {
			description: fm.description,
			images: [ogImage],
			title: fm.title,
		},
	};
}

export default async function Page({ params }: PageProps) {
	const { slug } = await params;
	const page = getWork(slug);
	if (!page) {
		notFound();
	}

	const fm = page.data as WorkFrontmatter;
	const startDate = new Date(fm.startDate);
	const endDate = fm.endDate ? new Date(fm.endDate) : undefined;
	const hasCaseStudy = !!(fm.chapters && fm.chapters.length > 0);
	const MDX = page.data.body;

	const chapters = fm.chapters ?? [];
	const firstChapterId = chapters[0]?.id;

	const chapterIndexById = new Map<string, number>();
	for (const [i, c] of chapters.entries()) {
		chapterIndexById.set(c.id, i);
	}

	const ChapterWithIndex = (props: {
		id: string;
		label: string;
		title: string;
		pullQuote?: string;
		children: React.ReactNode;
	}) => {
		const idx = chapterIndexById.get(props.id) ?? 0;
		return <Chapter {...props} index={idx} />;
	};

	const ScreensWithTitle = (props: React.ComponentProps<typeof Screens>) => (
		<Screens
			{...props}
			mockup={props.mockup ?? fm.screenshotMockup}
			title={props.title ?? fm.title}
		/>
	);

	const components = getMDXComponents({
		Chapter: ChapterWithIndex,
		Figure,
		Gallery,
		Screens: ScreensWithTitle,
	});

	const schemas = [
		buildCreativeWorkSchema({
			about: fm.tech,
			description: fm.description,
			endDate,
			external: [fm.appStore, fm.playStore].filter((s): s is string =>
				Boolean(s)
			),
			kind: "work",
			slug,
			startDate,
			title: fm.title,
			website: fm.website,
		}),
		buildBreadcrumbSchema([
			{ name: "home", url: "/" },
			{ name: "work", url: "/work" },
			{ name: fm.title, url: `/work/${slug}` },
		]),
	];

	return (
		<main>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: json-ld is serialised by jsonLd(); next has no other way to emit structured data
				dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }}
				type="application/ld+json"
			/>
			<ContentViewTracker kind="work" slug={slug} title={fm.title} />
			<Link
				className="meta-tag hover-dim mb-12 inline-flex items-center gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				href="/work"
			>
				← back
			</Link>

			<article className="relative">
				{hasCaseStudy && firstChapterId && (
					<a
						className="sr-only focus:not-sr-only focus:fixed focus:top-24 focus:left-4 focus:z-[200] focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:text-[13px] focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
						href={`#${firstChapterId}`}
					>
						skip to case study
					</a>
				)}

				{hasCaseStudy ? (
					<WorkCaseStudyHeader
						endDate={endDate}
						fm={fm}
						formatRange={formatRange}
						startDate={startDate}
					/>
				) : (
					<WorkDefaultHeader
						endDate={endDate}
						fm={fm}
						formatRange={formatRange}
						startDate={startDate}
					/>
				)}

				<div className={hasCaseStudy ? "space-y-16" : undefined}>
					<MDX components={components} />
				</div>
			</article>
		</main>
	);
}
