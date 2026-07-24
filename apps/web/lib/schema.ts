const SITE = "https://www.stormej.me";

/** Person blurb — global SEO, OG home, structured data. */
export const SITE_TAGLINE =
	"building fast, scalable mobile apps and ai-powered products end-to-end.";

export type SchemaObject = Record<string, unknown>;

export function buildPersonSchema(): SchemaObject {
	return {
		"@context": "https://schema.org",
		"@id": `${SITE}/#person`,
		"@type": "Person",
		address: {
			"@type": "PostalAddress",
			addressCountry: "IN",
			addressLocality: "new delhi",
			addressRegion: "delhi",
		},
		alternateName: ["stormej", "ekaksh", "ekaksh janweja"],
		description: SITE_TAGLINE,
		email: "mailto:jekaksh@gmail.com",
		familyName: "janweja",
		givenName: "ekaksh",
		image: `${SITE}/stormej.png`,
		jobTitle: "mobile engineer",
		knowsAbout: [
			"flutter",
			"dart",
			"ios development",
			"android development",
			"mobile app development",
			"arkit",
			"arcore",
			"augmented reality",
			"ar data capture",
			"riverpod",
			"firebase",
			"resumable file uploads",
			"background uploads",
			"multipart uploads",
			"react native",
			"typescript",
			"next.js",
			"cloudflare workers",
			"bun",
			"rest apis",
			"software engineering",
		],
		name: "ekaksh janweja",
		nationality: { "@type": "Country", name: "india" },
		sameAs: [
			"https://twitter.com/ekaksh_janweja",
			"https://x.com/ekaksh_janweja",
			"https://github.com/ekakshjanweja",
			"https://linkedin.com/in/ekakshjanweja",
		],
		url: SITE,
		worksFor: {
			"@type": "Organization",
			name: "digitaldomi",
		},
	};
}

export function buildWebSiteSchema(): SchemaObject {
	return {
		"@context": "https://schema.org",
		"@id": `${SITE}/#website`,
		"@type": "WebSite",
		alternateName: "ekaksh janweja",
		inLanguage: "en",
		name: "stormej.me",
		potentialAction: {
			"@type": "SearchAction",
			"query-input": "required name=search_term_string",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${SITE}/blog?q={search_term_string}`,
			},
		},
		publisher: { "@id": `${SITE}/#person` },
		url: SITE,
	};
}

export function buildProfilePageSchema(): SchemaObject {
	return {
		"@context": "https://schema.org",
		"@id": `${SITE}/#profile`,
		"@type": "ProfilePage",
		mainEntity: buildPersonSchema(),
		url: SITE,
	};
}

export interface BlogPostingInput {
	date?: string;
	description?: string;
	slug: string;
	title: string;
	updated?: string;
}

export function buildBlogPostingSchema(post: BlogPostingInput): SchemaObject {
	const url = `${SITE}/blog/${post.slug}`;
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		author: { "@id": `${SITE}/#person` },
		dateModified: post.updated ?? post.date,
		datePublished: post.date,
		description: post.description,
		headline: post.title,
		image: `${SITE}/og/blog/${post.slug}`,
		mainEntityOfPage: { "@id": url, "@type": "WebPage" },
		publisher: { "@id": `${SITE}/#person` },
		url,
	};
}

export interface CreativeWorkInput {
	about?: string[];
	description?: string;
	endDate?: string | Date;
	external?: string[];
	kind: "projects" | "work" | "trove";
	slug: string;
	startDate?: string | Date;
	title: string;
	website?: string;
}

export function buildCreativeWorkSchema(
	input: CreativeWorkInput
): SchemaObject {
	const url = `${SITE}/${input.kind}/${input.slug}`;
	const toIso = (d?: string | Date) =>
		d
			? d instanceof Date
				? d.toISOString()
				: new Date(d).toISOString()
			: undefined;
	const schema: SchemaObject = {
		"@context": "https://schema.org",
		"@type": "CreativeWork",
		author: { "@id": `${SITE}/#person` },
		creator: { "@id": `${SITE}/#person` },
		description: input.description,
		image: `${SITE}/og/${input.kind}/${input.slug}`,
		name: input.title,
		url,
	};
	if (input.about?.length) {
		schema.about = input.about;
	}
	const start = toIso(input.startDate);
	const end = toIso(input.endDate);
	if (start) {
		schema.dateCreated = start;
	}
	if (input.kind === "work") {
		if (start) {
			schema.startDate = start;
		}
		if (end) {
			schema.endDate = end;
		}
	}
	const externals = [input.website, ...(input.external ?? [])].filter(
		(s): s is string => Boolean(s)
	);
	if (externals.length) {
		schema.sameAs = externals;
	}
	return schema;
}

export interface BreadcrumbItem {
	name: string;
	url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): SchemaObject {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			item: item.url.startsWith("http") ? item.url : `${SITE}${item.url}`,
			name: item.name,
			position: index + 1,
		})),
	};
}

export function jsonLd(schema: SchemaObject | SchemaObject[]) {
	return JSON.stringify(schema);
}
