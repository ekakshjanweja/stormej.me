import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";
import { getMDXComponents } from "@/components/mdx";
import {
	buildBlogPostingSchema,
	buildBreadcrumbSchema,
	jsonLd,
} from "@/lib/schema";
import { source } from "@/lib/source";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	return source.generateParams().map(({ slug }) => ({
		slug: slug?.[0] ?? "",
	}));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const page = source.getPage([slug]);
	if (!page) {
		notFound();
	}

	const { title, description, date } = page.data as {
		title: string;
		description?: string;
		date?: string;
	};

	const canonical = `/blog/${slug}`;
	const ogImage = `/og/blog/${slug}`;

	return {
		alternates: { canonical },
		description,
		openGraph: {
			description,
			images: [{ alt: title, height: 630, url: ogImage, width: 1200 }],
			publishedTime: date,
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
	const page = source.getPage([slug]);
	if (!page) {
		notFound();
	}

	const MDX = page.data.body;

	const dateText = page.data.date
		? new Date(page.data.date).toLocaleDateString("en-US", {
				day: "numeric",
				month: "long",
				year: "numeric",
			})
		: null;

	const schemas = [
		buildBlogPostingSchema({
			date: page.data.date,
			description: page.data.description,
			slug,
			title: page.data.title,
		}),
		buildBreadcrumbSchema([
			{ name: "home", url: "/" },
			{ name: "blog", url: "/blog" },
			{ name: page.data.title, url: `/blog/${slug}` },
		]),
	];

	return (
		<main>
			<script
				// biome-ignore lint/security/noDangerouslySetInnerHtml: json-ld is serialised by jsonLd(); next has no other way to emit structured data
				dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }}
				type="application/ld+json"
			/>
			<ContentViewTracker kind="blog" slug={slug} title={page.data.title} />
			<Link
				className="meta-tag hover-dim mb-12 inline-flex items-center gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				href="/blog"
			>
				← back
			</Link>

			<header className="mb-10 space-y-4">
				<h1 className="headline text-[clamp(24px,2.8vw,36px)]">
					{page.data.title}
				</h1>
				{dateText && <p className="meta-tag">{dateText}</p>}
				{page.data.description && (
					<p className="font-light text-[14px] text-muted-foreground leading-[1.6]">
						{page.data.description}
					</p>
				)}
			</header>

			<article className="prose-fuma">
				<MDX
					components={getMDXComponents({
						a: createRelativeLink(source, page),
					})}
				/>
			</article>
		</main>
	);
}
