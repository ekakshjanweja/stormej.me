"use client";

import { usePathname } from "next/navigation";
import { useCallback, useRef } from "react";
import { SfxControl } from "@/components/sfx";
import { LINKS, PERSON } from "@/lib/profile";
import { gsap, reducedMotion } from "../_lib/gsap";
import { currentFor, PAGES } from "../_lib/pages";
import { letters } from "../_lib/split";
import { EmailPopover } from "./email-popover";
import { ExternalLink } from "./external-link";
import { MobileMenu } from "./mobile-menu";
import { PageLink } from "./page-link";
import { StripLink } from "./strip-link";

/* one turbulence filter, shared: whichever link is hovered borrows it while
   its displacement settles from 40 to 0 */
const WOBBLE_ID = "strip-wobble";

function Wobble() {
	return (
		<svg aria-hidden="true" className="sr-only" focusable="false">
			<filter id={WOBBLE_ID}>
				<feTurbulence
					baseFrequency="0.01 0.7"
					numOctaves="1"
					result="noise"
					type="fractalNoise"
				/>
				<feDisplacementMap
					in="SourceGraphic"
					in2="noise"
					scale="0"
					xChannelSelector="R"
					yChannelSelector="G"
				/>
			</filter>
		</svg>
	);
}

const wobble = (link: HTMLElement) => {
	if (reducedMotion()) {
		return;
	}
	const map = document.querySelector(`#${WOBBLE_ID} feDisplacementMap`);
	link.style.filter = `url(#${WOBBLE_ID})`;
	gsap.fromTo(
		map,
		{ attr: { scale: 40 } },
		{
			attr: { scale: 0 },
			duration: 0.7,
			ease: "power2.out",
			onComplete: () => {
				link.style.filter = "";
			},
			overwrite: true,
		}
	);
};

export function Nav() {
	const pathname = usePathname();
	const surnameRef = useRef<HTMLSpanElement>(null);

	const onPageEnter = useCallback(
		(event: React.PointerEvent<HTMLAnchorElement>) => {
			wobble(event.currentTarget);
		},
		[]
	);

	const showSurname = useCallback((show: boolean) => {
		const chars = surnameRef.current?.querySelectorAll("span");
		if (!chars || reducedMotion()) {
			return;
		}
		gsap.to(chars, {
			duration: 0.55,
			ease: show ? "power3.out" : "power3.in",
			overwrite: true,
			stagger: { each: 0.04, from: show ? "start" : "end" },
			y: 0,
			yPercent: show ? 0 : 120,
		});
	}, []);
	const onLogoEnter = useCallback(() => showSurname(true), [showSurname]);
	const onLogoLeave = useCallback(() => showSurname(false), [showSurname]);

	return (
		<header className="nav">
			<Wobble />
			<StripLink
				aria-label={`${PERSON.name}, home`}
				className="nav-logo"
				data-cursor="nav"
				href="/strip"
				label="home"
				onBlur={onLogoLeave}
				onFocus={onLogoEnter}
				onPointerEnter={onLogoEnter}
				onPointerLeave={onLogoLeave}
			>
				<span>{PERSON.first}</span>
				<span aria-hidden="true" className="nav-surname" ref={surnameRef}>
					{letters(PERSON.last).map(({ char, key }) => (
						<span key={key}>{char}</span>
					))}
				</span>
			</StripLink>

			<nav aria-label="pages" className="nav-pages">
				{PAGES.map((page, index) => (
					<span key={page.href}>
						<PageLink
							aria-current={currentFor(pathname, page.href)}
							data-cursor="nav"
							href={page.href}
							label={page.label}
							onPointerEnter={onPageEnter}
						>
							{page.label}
						</PageLink>
						{index < PAGES.length - 1 ? ", " : null}
					</span>
				))}
			</nav>

			<div className="nav-tools">
				<SfxControl />
				<nav aria-label="elsewhere" className="nav-social">
					<ExternalLink data-cursor="nav" href={LINKS.github}>
						github
					</ExternalLink>
					<ExternalLink data-cursor="nav" href={LINKS.linkedin}>
						linkedin
					</ExternalLink>
					<EmailPopover />
				</nav>
				<MobileMenu pathname={pathname} />
			</div>
		</header>
	);
}
