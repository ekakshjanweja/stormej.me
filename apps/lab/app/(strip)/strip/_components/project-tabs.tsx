"use client";

import {
	type CSSProperties,
	type KeyboardEvent,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";
import { PROJECTS, type Project, SITE } from "@/lib/profile";
import { playSfx } from "@/lib/sfx";
import { FeatureCaption, FeatureFilm } from "./feature-film";
import { PageLink } from "./page-link";
import { ProgressiveImage } from "./progressive-image";

/* the projects, the way the work is: their names are tabs, and the frame
   beside them takes on whichever is picked. a project with a clip plays it
   (and opens into its film); one without gets a card of its own name and
   what it's made with, with any stills dropped loosely on top */

const PICKS = ["burrow", "aarthiqai", "better-auth-flutter"]
	.map((slug) => PROJECTS.find((project) => project.slug === slug))
	.filter((project): project is Project => project !== undefined);

const KEY_STEPS: Record<string, number> = {
	ArrowDown: 1,
	ArrowLeft: -1,
	ArrowRight: 1,
	ArrowUp: -1,
};

/* where a project's stills lie on its card: loose, tilted, poking out over
   the top edge. as many places as any project has stills */
const LOOSE: (CSSProperties & { "--tilt": string })[] = [
	{ "--tilt": "6deg", height: "92%", right: "7%", top: "-30%" },
	{ "--tilt": "-5deg", height: "62%", right: "30%", top: "-14%" },
];

/** a project with no clip: a card of its name, with any stills it has
    dropped loosely on top. reach for one and it straightens and comes
    forward; a click keeps it there */
function ProjectCard({ project }: { project: Project }) {
	const [open, setOpen] = useState<string | null>(null);
	const toggle = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		const { src } = event.currentTarget.dataset;
		setOpen((current) => (current === src ? null : (src ?? null)));
	}, []);
	const close = useCallback(() => setOpen(null), []);
	const shots = project.shots ?? [];

	return (
		<div className="hm-feature">
			<div
				className="hm-feature-frame"
				data-kind="card"
				data-loose={shots.length > 0 ? "" : undefined}
			>
				<span aria-hidden="true" className="hm-card">
					{/* with stills on it, the card leaves the name to the caption */}
					{shots.length > 0 ? null : (
						<span className="hm-card-title">{project.title}</span>
					)}
					<span className="hm-card-stack">{project.stack.join(" · ")}</span>
				</span>
				{shots.map((shot, index) => (
					<button
						aria-expanded={open === shot.src}
						aria-label={shot.alt}
						className="hm-loose"
						data-cursor="view"
						data-open={open === shot.src ? "" : undefined}
						data-src={shot.src}
						key={shot.src}
						onBlur={close}
						onClick={toggle}
						style={{
							...LOOSE[index % LOOSE.length],
							aspectRatio: `${shot.width} / ${shot.height}`,
						}}
						type="button"
					>
						<ProgressiveImage
							alt=""
							height={shot.height}
							sizes="320px"
							src={shot.src}
							width={shot.width}
						/>
					</button>
				))}
			</div>
			<FeatureCaption project={project} />
		</div>
	);
}

export function ProjectTabs() {
	const id = useId();
	const [selected, setSelected] = useState(PICKS[0]?.slug ?? "");
	const tabsRef = useRef<HTMLDivElement>(null);
	const project =
		PICKS.find((item) => item.slug === selected) ?? PICKS[0] ?? null;

	const onPick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		const { slug } = event.currentTarget.dataset;
		if (slug) {
			setSelected(slug);
		}
	}, []);

	/* arrows move along the tabs, as a tablist should */
	const onKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			const step = KEY_STEPS[event.key];
			if (!step) {
				return;
			}
			event.preventDefault();
			const index = PICKS.findIndex((item) => item.slug === selected);
			const next = PICKS[(index + step + PICKS.length) % PICKS.length];
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

	if (!project) {
		return null;
	}

	return (
		<>
			<div
				aria-labelledby={`${id}-${project.slug}`}
				className="hm-panel"
				data-home-reveal=""
				id={`${id}-panel`}
				role="tabpanel"
			>
				{/* a fresh stage for each project, so it eases in and its film
				    starts over */}
				<div className="hm-stage" key={project.slug}>
					{project.video ? (
						<FeatureFilm project={project} />
					) : (
						<ProjectCard project={project} />
					)}
				</div>
			</div>
			<div className="hm-list">
				<p className="s-tabs-hint">pick a project</p>
				<div
					aria-label="projects"
					className="hm-tabs"
					onKeyDown={onKeyDown}
					ref={tabsRef}
					role="tablist"
				>
					{PICKS.map((item) => {
						const active = item.slug === selected;
						return (
							<button
								aria-controls={`${id}-panel`}
								aria-selected={active}
								className="hm-list-link"
								data-cursor="nav"
								data-home-reveal=""
								data-sfx="switch"
								data-slug={item.slug}
								id={`${id}-${item.slug}`}
								key={item.slug}
								onClick={onPick}
								role="tab"
								tabIndex={active ? 0 : -1}
								type="button"
							>
								<span className="hm-list-name">{item.title}</span>
								<span className="hm-list-meta">{item.summary}</span>
							</button>
						);
					})}
				</div>
				<PageLink
					className="s-more-link"
					data-cursor="nav"
					href={`${SITE}/projects`}
					label="projects"
				>
					all the projects →
				</PageLink>
			</div>
		</>
	);
}
