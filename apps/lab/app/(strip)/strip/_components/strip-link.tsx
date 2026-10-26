"use client";

import Link from "next/link";
import {
	type ComponentProps,
	createContext,
	type MouseEvent,
	use,
	useCallback,
} from "react";

/** plays the curtain, swaps the page, lifts the curtain */
type Navigate = (href: string, label: string) => void;

export const NavigateContext = createContext<Navigate>(() => undefined);

export const useNavigate = () => use(NavigateContext);

type StripLinkProps = ComponentProps<typeof Link> & {
	href: string;
	/** the word the curtain shows while the page changes */
	label: string;
};

/** an internal link that goes through the curtain. modified clicks (new
    tab, etc.) behave like any other link */
export function StripLink({ href, label, onClick, ...rest }: StripLinkProps) {
	const navigate = useNavigate();

	const handleClick = useCallback(
		(event: MouseEvent<HTMLAnchorElement>) => {
			onClick?.(event);
			const modified =
				event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
			if (event.defaultPrevented || event.button !== 0 || modified) {
				return;
			}
			event.preventDefault();
			navigate(href, label);
		},
		[href, label, navigate, onClick]
	);

	return <Link href={href} onClick={handleClick} {...rest} />;
}
