/**
 * Kill switches for the trove section.
 *
 * Flipping {@link TROVE_ENABLED} to false removes trove everywhere: the home
 * row, the /trove index, every component page, the nav link, llms.txt, and the
 * og images. The mdx and the flutter builds stay on disk, so turning it back on
 * is a one line change.
 *
 * {@link DISABLED_TROVE_SLUGS} hides individual components while the section
 * itself stays up. Frontmatter also has `published` and `hidden`, which only
 * affect the listings; a slug listed here 404s on its own page too.
 */
export const TROVE_ENABLED: boolean = true;

/** Slugs to hide, e.g. ["app-toast"]. Matches the mdx filename. */
export const DISABLED_TROVE_SLUGS: readonly string[] = [];

export function isTroveSlugEnabled(slug: string): boolean {
	return TROVE_ENABLED && !DISABLED_TROVE_SLUGS.includes(slug);
}
