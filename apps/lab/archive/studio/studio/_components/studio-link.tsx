"use client";

import Link from "next/link";
import { type ComponentProps, useCallback } from "react";
import { useStudioNavigate } from "./transition";

/* a next link between studio pages that plays the curtain. modifier clicks,
   middle clicks and new tabs never reach onNavigate, so they behave like
   any link. the href stays bare: next adds the base path itself */

type StudioLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
	href: string;
};

export function StudioLink({ href, ...props }: StudioLinkProps) {
	const navigate = useStudioNavigate();
	const onNavigate = useCallback(
		(event: { preventDefault: () => void }) => {
			if (navigate(href)) {
				event.preventDefault();
			}
		},
		[href, navigate]
	);
	return <Link href={href} onNavigate={onNavigate} {...props} />;
}
