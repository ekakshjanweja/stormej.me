"use client";

import {
	type KeyboardEvent,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";
import { withBase } from "@/lib/base";
import { STATS, WORK, yearsShipping } from "@/lib/profile";
import { playSfx } from "@/lib/sfx";
import { useMovable } from "../_lib/movable";
import { GithubActivity } from "./github-activity";
import { PageLink } from "./page-link";
import { ProgressiveImage } from "./progressive-image";
import { ShotCycle } from "./shot-cycle";

/* at a glance, and the work itself, side by side. the teams are tabs: pick
   one and the phone beside it takes on that app's screens while the notes
   swap to that job. fpv labs is up first; "view details" goes to the full
   story on stormej.me */

const LOGOS: Record<string, string> = {
	bullzeye: "/media/bullzeye_light.webp",
	"digital-domi": "/media/digital-domi.svg",
	"fpv-labs": "/media/fpv_light.webp",
	merlin: "/media/merlin.svg",
	"team-black-box": "/media/team-black-box.webp",
	zuai: "/media/zuai.svg",
};

/* every screen each case has, in the order its story tells it */
const SCREENS: Record<string, string[]> = {
	"digital-domi": ["one", "two", "three", "four", "five", "six", "seven"].map(
		(n) => `domi_${n}`
	),
	"fpv-labs": [
		"one",
		"two",
		"three",
		"four",
		"five",
		"six",
		"seven",
		"eight",
	].map((n) => `fpv_${n}`),
	merlin: [
		"merlin_one",
		"merlin_two",
		"merlin_three",
		"merlin_four",
		"merlin_five",
		"merlin_six",
		"merlin_seven",
		"wallflower_one",
		"wallflower_two",
	],
	zuai: ["zuai_one", "zuai_two", "zuai_three"],
};

/* the line under a company's name: the product where it has one */
const PRODUCT: Record<string, string> = {
	"fpv-labs": "stera capture",
	merlin: "merlin and wallflower",
	zuai: "professor curious",
};

const screensFor = (slug: string) =>
	(SCREENS[slug] ?? []).map((name) =>
		withBase(`/media/cases/${slug}/${name}.webp`)
	);

const years = (start: string, end: string | null) => {
	const from = start.slice(0, 4);
	if (!end) {
		return `${from}–now`;
	}
	const to = end.slice(0, 4);
	return from === to ? from : `${from}–${to.slice(-2)}`;
};

const NOW = WORK.find((job) => job.end === null);
const FIRST = "fpv-labs";

/** a team's logo, as a tab. it can be picked up and flung about; let go
    and it springs back into its place. a drag doesn't count as a pick */
function LogoTab({
	active,
	company,
	id,
	onPick,
	slug,
}: {
	active: boolean;
	company: string;
	id: string;
	onPick: (slug: string) => void;
	slug: string;
}) {
	const ref = useRef<HTMLButtonElement>(null);
	const movedRef = useMovable(ref, { home: true });
	const src = LOGOS[slug];

	const pick = useCallback(() => {
		if (!movedRef.current) {
			onPick(slug);
		}
	}, [movedRef, onPick, slug]);

	return (
		<button
			aria-controls={`${id}-panel`}
			aria-label={company}
			aria-selected={active}
			className="s-logo"
			data-cursor="nav"
			data-sfx="switch"
			data-slug={slug}
			id={`${id}-${slug}`}
			onClick={pick}
			ref={ref}
			role="tab"
			tabIndex={active ? 0 : -1}
			type="button"
		>
			{src ? (
				<ProgressiveImage
					alt=""
					draggable={false}
					fill
					sizes="72px"
					src={withBase(src)}
				/>
			) : null}
			<span aria-hidden="true" className="s-logo-name">
				{company}
			</span>
		</button>
	);
}

export function WorkTabs() {
	const id = useId();
	const [selected, setSelected] = useState(FIRST);
	const tabsRef = useRef<HTMLDivElement>(null);
	const job = WORK.find((item) => item.slug === selected) ?? WORK[0];

	/* arrows move along the tabs, as a tablist should */
	const onKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
			if (!step) {
				return;
			}
			event.preventDefault();
			const index = WORK.findIndex((item) => item.slug === selected);
			const next = WORK[(index + step + WORK.length) % WORK.length];
			if (next) {
				setSelected(next.slug);
				playSfx("switch");
				tabsRef.current
					?.querySelector<HTMLElement>(`[data-slug="${next.slug}"]`)
					?.focus();
			}
		},
		[selected]
	);

	if (!job) {
		return null;
	}
	const screens = screensFor(job.slug);
	const logo = LOGOS[job.slug];

	return (
		<section
			aria-labelledby="glance-title"
			className="s-process s-work"
			data-process=""
		>
			<div className="s-glance-col" data-process-index="">
				<p className="s-index">03/ at a glance</p>
				<h2 className="s-glance-title" id="glance-title">
					right now: {NOW?.role ?? "building"} at{" "}
					<em>{NOW?.company ?? "bullzeye"}</em>.
				</h2>
				<dl className="s-stats">
					<div>
						<dt>years shipping</dt>
						<dd>{yearsShipping()}</dd>
					</div>
					<div>
						<dt>teams</dt>
						<dd>{STATS.startups}</dd>
					</div>
				</dl>
				<GithubActivity />
				<p className="s-tabs-hint">pick a team</p>
				<div
					aria-label="teams"
					className="s-logos"
					onKeyDown={onKeyDown}
					ref={tabsRef}
					role="tablist"
				>
					{WORK.map((item) => (
						<LogoTab
							active={item.slug === selected}
							company={item.company}
							id={id}
							key={item.slug}
							onPick={setSelected}
							slug={item.slug}
						/>
					))}
				</div>
			</div>

			<div
				aria-labelledby={`${id}-${job.slug}`}
				className="s-process-body s-work-panel"
				id={`${id}-panel`}
				key={job.slug}
				role="tabpanel"
			>
				<div className="s-shots" data-process-shot="">
					{screens.length > 0 ? (
						<ShotCycle alt={`the ${job.company} app`} screens={screens} />
					) : (
						<span className="cycle cycle-empty">
							{logo ? (
								<span className="cycle-logo">
									<ProgressiveImage
										alt=""
										fill
										sizes="160px"
										src={withBase(logo)}
									/>
								</span>
							) : null}
							<span className="cycle-note">screens coming soon</span>
						</span>
					)}
				</div>
				<div className="s-process-meta">
					<p className="s-caption">
						<span>{years(job.start, job.end)}</span>
						<span>{job.role}</span>
					</p>
					<h3 className="s-process-title" data-process-title="">
						<span>{job.company}</span>
						<span>
							<em>{PRODUCT[job.slug] ?? job.tech.slice(0, 2).join(" · ")}</em>
						</span>
					</h3>
					<p className="s-process-text">{job.summary}</p>
					<PageLink
						className="s-detail"
						data-cursor="nav"
						href={job.href}
						label={job.company}
					>
						view details <span aria-hidden="true">→</span>
					</PageLink>
				</div>
			</div>
		</section>
	);
}
