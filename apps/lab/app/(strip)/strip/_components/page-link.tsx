"use client";

import type { ComponentProps } from "react";
import { SITE } from "@/lib/profile";
import { ExternalLink } from "./external-link";
import { StripLink } from "./strip-link";

type PageLinkProps = Omit<ComponentProps<"a">, "href" | "ref"> & {
	href: string;
	/** the word the curtain shows, for pages inside the strip */
	label: string;
};

/** a link to one of the strip's pages, wherever it lives: inside the strip
    through the curtain, the main site in the same tab (it's the same
    domain in production), anything else in a new one */
export function PageLink({ href, label, ...rest }: PageLinkProps) {
	if (href.startsWith("/")) {
		return <StripLink href={href} label={label} {...rest} />;
	}
	if (href.startsWith(SITE)) {
		return <a href={href} {...rest} />;
	}
	return <ExternalLink href={href} {...rest} />;
}
