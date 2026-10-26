import type { ComponentProps } from "react";

/* every link that leaves the studio: a new tab, no opener, no referrer, and
   said out loud for screen readers */

export const NEW_TAB = "opens in a new tab";

type ExternalLinkProps = Omit<ComponentProps<"a">, "rel" | "target"> & {
	href: string;
};

export function ExternalLink({ children, ...props }: ExternalLinkProps) {
	return (
		<a {...props} rel="noopener noreferrer" target="_blank">
			{children}
			{props["aria-label"] ? null : (
				<span className="sr-only"> ({NEW_TAB})</span>
			)}
		</a>
	);
}
