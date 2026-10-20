import projectsMeta from "@/content/projects/meta.json";
import { projectsSource } from "@/lib/source";

/** Slug order from `content/projects/meta.json` → `pages` (Fumadocs meta). */
const projectOrderIndex = new Map(
	(projectsMeta.pages ?? []).map((slug, i) => [slug, i])
);

function sortKeyForSlug(slug: string) {
	return projectOrderIndex.get(slug) ?? Number.POSITIVE_INFINITY;
}

export interface ProjectFrontmatter {
	accent?: string;
	archived?: boolean;
	cover?: string;
	coverPoster?: string;
	description?: string;
	github?: string;
	hidden?: boolean;
	highlights?: string[];
	icon?: string;
	images?: string[];
	imagesOrientation?: "portrait" | "landscape";
	inlineGallery?: boolean;
	kind?: string;
	overview?: string;
	platform?: string;
	published?: boolean;
	status?: string;
	subtitle?: string;
	tech: string[];
	title: string;
	/** self-hosted mp4, played inline when there is no youtube link */
	video?: string;
	videoOrientation?: "portrait" | "landscape";
	videoPoster?: string;
	website?: string;
	year?: number;
	youtube?: string;
}

/** what a project's home card shows: a looping clip, or a still. */
export type ProjectCover =
	| {
			kind: "video";
			poster?: string;
			/** a tall clip: gets a narrow card, filled edge to edge */
			portrait?: boolean;
			src: string;
	  }
	| { kind: "youtube"; id: string; start: number }
	| { kind: "image"; src: string; style: ProjectCoverStyle };

/** `window` floats a landscape shot inside the tint, `fill` bleeds edge to edge. */
export type ProjectCoverStyle = "fill" | "window";

export interface ProjectListItem {
	accent?: string;
	archived?: boolean;
	cover?: ProjectCover;
	description?: string;
	hidden?: boolean;
	icon?: string;
	kind?: string;
	slug: string;
	status?: string;
	subtitle?: string;
	title: string;
	url: string;
	website?: string;
	year?: number;
}

const VIDEO_FILE = /\.(mp4|webm|mov)$/i;
const YOUTUBE_ID =
	/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/;

const YOUTUBE_START = /[?&](?:t|start)=(\d+)/;

/** `?t=42` or `&start=42` on the link picks where the card's clip begins */
function youtubeStart(url: string) {
	return Number(url.match(YOUTUBE_START)?.[1] ?? 0);
}

/** frontmatter paths are written with or without the leading slash */
function publicPath(src: string) {
	return src.startsWith("/") || src.startsWith("http") ? src : `/${src}`;
}

/** cover → own clip → youtube thumbnail → first screenshot. */
function resolveCover(fm: ProjectFrontmatter): ProjectCover | undefined {
	if (fm.cover) {
		const src = publicPath(fm.cover);
		return VIDEO_FILE.test(src)
			? {
					kind: "video",
					// the card loop is cut from the demo, so it shares its shape
					portrait: fm.videoOrientation === "portrait",
					poster: fm.coverPoster ?? fm.videoPoster,
					src,
				}
			: { kind: "image", src, style: "window" };
	}
	if (fm.video) {
		return {
			kind: "video",
			portrait: fm.videoOrientation === "portrait",
			poster: fm.videoPoster,
			src: fm.video,
		};
	}
	const youtubeId = fm.youtube?.match(YOUTUBE_ID)?.[1];
	if (fm.youtube && youtubeId) {
		return { id: youtubeId, kind: "youtube", start: youtubeStart(fm.youtube) };
	}
	const firstImage = fm.images?.[0];
	if (firstImage && fm.imagesOrientation === "landscape") {
		return { kind: "image", src: publicPath(firstImage), style: "window" };
	}
}

export function listProjects(): ProjectListItem[] {
	const pages = projectsSource.getPages().filter((p) => {
		const fm = p.data as Partial<ProjectFrontmatter>;
		return fm.published !== false;
	});

	return pages
		.map((page) => {
			const fm = page.data as ProjectFrontmatter;
			const slug = page.slugs[0] ?? "";
			return {
				_sortTitle: fm.title,
				accent: fm.accent,
				archived: fm.archived,
				cover: resolveCover(fm),
				description: fm.description,
				hidden: fm.hidden,
				icon: fm.icon,
				kind: fm.kind,
				slug,
				status: fm.status,
				subtitle: fm.subtitle,
				title: fm.title,
				url: page.url,
				website: fm.website,
				year: fm.year,
			};
		})
		.sort((a, b) => {
			const oa = sortKeyForSlug(a.slug);
			const ob = sortKeyForSlug(b.slug);
			if (oa !== ob) {
				return oa - ob;
			}
			return a._sortTitle.localeCompare(b._sortTitle, undefined, {
				sensitivity: "base",
			});
		})
		.map(({ _sortTitle: _t, ...rest }) => rest);
}

export function getProject(slug: string) {
	const page = projectsSource.getPage([slug]);
	if (!page) {
		return null;
	}
	return page;
}
