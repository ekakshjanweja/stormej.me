import type { ComponentProps } from "react";

/** a link off the strip: a new tab, no opener, no referrer, and a word for
    screen readers that it leaves */
export function ExternalLink({
	children,
	href,
	...rest
}: ComponentProps<"a"> & { href: string }) {
	return (
		<a href={href} rel="noopener noreferrer" target="_blank" {...rest}>
			{children}
			<span className="sr-only"> (opens in a new tab)</span>
		</a>
	);
}
