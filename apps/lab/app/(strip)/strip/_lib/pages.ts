import { SITE } from "@/lib/profile";

/* the strip's pages. only the home lives in the strip now: what the about
   page said, the home's faces open as cards. work, projects and writing are
   stormej.me's own, and contact lives in the outro. strip paths are bare:
   next/link and the curtain's router.push add the base path themselves */
export const PAGES = [
	{ href: `${SITE}/work`, label: "work" },
	{ href: `${SITE}/projects`, label: "projects" },
	{ href: `${SITE}/blog`, label: "writing" },
] as const;

/** "page" on the page itself, "true" anywhere under it */
export const currentFor = (pathname: string, href: string) => {
	if (pathname === href) {
		return "page" as const;
	}
	return href.startsWith("/strip/") && pathname.startsWith(`${href}/`)
		? ("true" as const)
		: undefined;
};
