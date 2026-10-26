"use client";

import { usePathname } from "next/navigation";
import { useCallback, useRef } from "react";
import { SfxControl } from "@/components/sfx";
import { LINKS, PERSON } from "@/lib/profile";
import { ContactDialog, openDialog } from "./contact-dialog";
import { ExternalLink } from "./external-link";
import { MainButtonLabel } from "./main-button";
import { StudioLink } from "./studio-link";

/* the header stays put across studio pages. the pages pill marks where you
   are (a case page counts as work); on the home page the logo and "how we
   can work" are in-page anchors, everywhere else they go home first */

const HOME = "/studio";

const PAGES = [
	{ href: "/studio/work", label: "work" },
	{ href: "/studio/writing", label: "notes" },
	{ href: "/studio/about", label: "about" },
];

const currentFor = (pathname: string, href: string) => {
	if (pathname === href) {
		return "page";
	}
	return pathname.startsWith(`${href}/`) ? "true" : undefined;
};

export function SiteHead() {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const open = useCallback(() => openDialog(dialogRef.current), []);
	const pathname = usePathname();
	const home = pathname === HOME;

	return (
		<header className="site-head">
			{home ? (
				<a className="site-logo" href="#top">
					<span aria-hidden="true">e</span>
					<span className="sr-only">{PERSON.name}, back to the top</span>
				</a>
			) : (
				<StudioLink className="site-logo" href={HOME}>
					<span aria-hidden="true">e</span>
					<span className="sr-only">{PERSON.name}, studio home</span>
				</StudioLink>
			)}
			<nav aria-label="studio" className="site-nav">
				<SfxControl />
				<ul className="site-pages">
					{PAGES.map((page) => {
						const current = currentFor(pathname, page.href);
						return (
							<li key={page.href}>
								<StudioLink
									aria-current={current}
									className={`site-page${current ? "is-active" : ""}`}
									href={page.href}
								>
									{page.label}
								</StudioLink>
							</li>
						);
					})}
				</ul>
				<ul className="site-menu">
					<li className="site-menu-link">
						{home ? (
							<a className="btn-main btn-main-secondary" href="#ways">
								<MainButtonLabel>how we can work</MainButtonLabel>
							</a>
						) : (
							<StudioLink
								className="btn-main btn-main-secondary"
								href={`${HOME}#ways`}
							>
								<MainButtonLabel>how we can work</MainButtonLabel>
							</StudioLink>
						)}
					</li>
					<li>
						<button
							aria-haspopup="dialog"
							className="btn-main btn-main-primary"
							onClick={open}
							type="button"
						>
							<MainButtonLabel>say hi</MainButtonLabel>
						</button>
					</li>
				</ul>
				<ul aria-label="versions" className="site-switch">
					<li>
						<span aria-current="page" className="site-switch-item is-active">
							studio
						</span>
					</li>
					<li>
						<ExternalLink className="site-switch-item" href={LINKS.site}>
							site
						</ExternalLink>
					</li>
				</ul>
			</nav>
			<ContactDialog dialogRef={dialogRef} />
		</header>
	);
}
