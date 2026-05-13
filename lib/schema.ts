const SITE = "https://www.stormej.me";

/** Person blurb — global SEO, OG home, structured data. */
export const SITE_TAGLINE =
  "building fast, scalable mobile apps and ai-powered products end-to-end.";

export type SchemaObject = Record<string, unknown>;

export function buildPersonSchema(): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE}/#person`,
    name: "ekaksh janweja",
    alternateName: ["stormej", "ekaksh", "ekaksh janweja"],
    givenName: "ekaksh",
    familyName: "janweja",
    jobTitle: "mobile engineer",
    description: SITE_TAGLINE,
    url: SITE,
    image: `${SITE}/stormej.png`,
    email: "mailto:jekaksh@gmail.com",
    sameAs: [
      "https://twitter.com/ekaksh_janweja",
      "https://x.com/ekaksh_janweja",
      "https://github.com/ekakshjanweja",
      "https://linkedin.com/in/ekakshjanweja",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "new delhi",
      addressRegion: "delhi",
      addressCountry: "IN",
    },
    nationality: { "@type": "Country", name: "india" },
    worksFor: {
      "@type": "Organization",
      name: "digitaldomi",
    },
    knowsAbout: [
      "flutter",
      "dart",
      "ios development",
      "android development",
      "mobile app development",
      "react native",
      "typescript",
      "next.js",
      "cloudflare workers",
      "bun",
      "rest apis",
      "software engineering",
    ],
  };
}

export function buildWebSiteSchema(): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    name: "stormej.me",
    alternateName: "ekaksh janweja",
    url: SITE,
    inLanguage: "en",
    publisher: { "@id": `${SITE}/#person` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildProfilePageSchema(): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE}/#profile`,
    url: SITE,
    mainEntity: buildPersonSchema(),
  };
}

export interface BlogPostingInput {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  updated?: string;
}

export function buildBlogPostingSchema(post: BlogPostingInput): SchemaObject {
  const url = `${SITE}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: `${SITE}/og/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@id": `${SITE}/#person` },
    publisher: { "@id": `${SITE}/#person` },
  };
}

export interface CreativeWorkInput {
  kind: "projects" | "work";
  slug: string;
  title: string;
  description?: string;
  about?: string[];
  startDate?: string | Date;
  endDate?: string | Date;
  website?: string;
  external?: string[];
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
    name: input.title,
    description: input.description,
    url,
    image: `${SITE}/og/${input.kind}/${input.slug}`,
    creator: { "@id": `${SITE}/#person` },
    author: { "@id": `${SITE}/#person` },
  };
  if (input.about?.length) schema.about = input.about;
  const start = toIso(input.startDate);
  const end = toIso(input.endDate);
  if (start) schema.dateCreated = start;
  if (input.kind === "work") {
    if (start) schema.startDate = start;
    if (end) schema.endDate = end;
  }
  const externals = [input.website, ...(input.external ?? [])].filter(
    (s): s is string => Boolean(s)
  );
  if (externals.length) schema.sameAs = externals;
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
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE}${item.url}`,
    })),
  };
}

export function jsonLd(schema: SchemaObject | SchemaObject[]) {
  return JSON.stringify(schema);
}
