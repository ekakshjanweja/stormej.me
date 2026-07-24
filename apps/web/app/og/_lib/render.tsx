import { ImageResponse } from "next/og";
import { SITE_TAGLINE } from "@/lib/schema";

export type OgKind = "home" | "blog" | "projects" | "gear" | "work" | "trove";
export type OgVariant = "editorial" | "dark" | "mono" | "minimal";

const FONT_SRC = /src: url\((.+?)\) format\('(opentype|truetype)'\)/;
const OWN_NAME = /^ekaksh\s+janweja$/i;

/** Headline type shrinks in two steps so long titles still fit the card. */
function headlineFontSizeSans(headline: string) {
	if (headline.length > 50) {
		return 48;
	}
	if (headline.length > 28) {
		return 60;
	}
	return 80;
}

function headlineFontSize(headline: string) {
	if (headline.length > 50) {
		return 76;
	}
	if (headline.length > 28) {
		return 96;
	}
	return 120;
}

const KIND_LABEL: Record<OgKind, string | null> = {
	blog: "writing",
	gear: "gear",
	home: null,
	projects: "projects",
	trove: "trove",
	work: "work",
};

async function loadGoogleFont(
	family: string,
	text: string,
	weight = 400,
	italic = false
) {
	const axis = italic ? ":ital,wght@1," : ":wght@";
	const url = `https://fonts.googleapis.com/css2?family=${family}${axis}${weight}&text=${encodeURIComponent(text)}`;
	const css = await (await fetch(url)).text();
	const resource = css.match(FONT_SRC);
	if (!resource) {
		throw new Error(`failed to resolve font URL for ${family}`);
	}
	const response = await fetch(resource[1]);
	if (response.status !== 200) {
		throw new Error(`failed to load font data for ${family}`);
	}
	return await response.arrayBuffer();
}

const hexToRgba = (hex: string, alpha: number) => {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface RenderOgOptions {
	kind: OgKind;
	meta?: string | null;
	title?: string | null;
	variant?: OgVariant | null;
}

interface Computed {
	byline: string;
	headline: string;
	kicker: string | null;
	metaText: string | null;
}

function compute({ kind, title, meta }: RenderOgOptions): Computed {
	const headline = (title?.trim() || "ekaksh janweja") as string;
	const kicker = KIND_LABEL[kind];
	let metaText = meta?.trim() || null;
	const headlineIsName = OWN_NAME.test(headline);
	if (kind === "home" && headlineIsName && !metaText) {
		metaText = SITE_TAGLINE;
	}
	const byline = headlineIsName ? "stormej" : "ekaksh janweja";
	return { byline, headline, kicker, metaText };
}

export function renderOg(opts: RenderOgOptions) {
	const variant = opts.variant ?? "editorial";
	switch (variant) {
		case "dark":
			return renderDark(opts);
		case "mono":
			return renderMono(opts);
		case "minimal":
			return renderMinimal(opts);
		default:
			return renderEditorial(opts);
	}
}

// ---------- Variant: editorial (light, serif italic) ----------
async function renderEditorial(opts: RenderOgOptions) {
	const { headline, kicker, metaText } = compute(opts);
	const bgColor = "#FAFAF7";
	const fgColor = "#2A2E33";
	const mutedColor = "#7A7E83";

	const monoText = `stormej${kicker ?? ""}${metaText ?? ""}`;
	const [serifBuf, monoBuf] = await Promise.all([
		loadGoogleFont("Instrument+Serif", headline, 400, true),
		loadGoogleFont("Space+Mono", monoText, 400, false),
	]);

	return new ImageResponse(
		<div
			style={{
				backgroundColor: bgColor,
				color: fgColor,
				display: "flex",
				flexDirection: "column",
				fontFamily: "Space Mono",
				height: "100%",
				overflow: "hidden",
				padding: "72px 96px",
				position: "relative",
				width: "100%",
			}}
		>
			<div
				style={{
					backgroundImage: `
              linear-gradient(${hexToRgba(fgColor, 0.04)} 1px, transparent 1px),
              linear-gradient(90deg, ${hexToRgba(fgColor, 0.04)} 1px, transparent 1px)
            `,
					backgroundSize: "48px 48px",
					display: "flex",
					inset: "0",
					position: "absolute",
				}}
			/>
			<div
				style={{
					alignItems: "center",
					display: "flex",
					justifyContent: "space-between",
					position: "relative",
					zIndex: "10",
				}}
			>
				<div
					style={{
						color: fgColor,
						display: "flex",
						fontSize: 18,
						letterSpacing: "0.16em",
					}}
				>
					stormej
				</div>
				{kicker && (
					<div
						style={{
							color: mutedColor,
							display: "flex",
							fontSize: 18,
							letterSpacing: "0.16em",
						}}
					>
						{kicker}
					</div>
				)}
			</div>
			<div
				style={{
					display: "flex",
					flex: 1,
					flexDirection: "column",
					justifyContent: "center",
					position: "relative",
					zIndex: "10",
				}}
			>
				<div
					style={{
						color: fgColor,
						display: "flex",
						fontFamily: "Instrument Serif",
						fontSize: headlineFontSize(headline),
						fontStyle: "italic",
						letterSpacing: "-0.02em",
						lineHeight: 1.05,
						maxWidth: "1000px",
					}}
				>
					{headline}
				</div>
				{metaText && (
					<div
						style={{
							color: mutedColor,
							display: "flex",
							fontSize: 22,
							letterSpacing: "0.12em",
							marginTop: "32px",
							maxWidth: "900px",
							textTransform: "uppercase",
						}}
					>
						{metaText}
					</div>
				)}
			</div>
		</div>,
		{
			fonts: [
				{
					data: serifBuf,
					name: "Instrument Serif",
					style: "italic",
					weight: 400,
				},
				{ data: monoBuf, name: "Space Mono", style: "normal", weight: 400 },
			],
			height: 630,
			width: 1200,
		}
	);
}

// ---------- Variant: dark (dark slate, cream serif) ----------
async function renderDark(opts: RenderOgOptions) {
	const { headline, kicker, metaText, byline } = compute(opts);
	const bgColor = "#1B1F24";
	const fgColor = "#F2EFE9";
	const mutedColor = "#8E8F92";
	const borderColor = "#2E3338";
	const accentColor = "#C9B6FF";

	const monoText = `STORMEJ.ME${kicker ?? ""}${metaText ?? ""}${byline}${SITE_TAGLINE}`;
	const [serifBuf, monoBuf] = await Promise.all([
		loadGoogleFont("Instrument+Serif", headline, 400, true),
		loadGoogleFont("Space+Mono", monoText, 400, false),
	]);

	return new ImageResponse(
		<div
			style={{
				backgroundColor: bgColor,
				color: fgColor,
				display: "flex",
				flexDirection: "column",
				fontFamily: "Space Mono",
				height: "100%",
				overflow: "hidden",
				padding: "80px 96px",
				position: "relative",
				width: "100%",
			}}
		>
			<div
				style={{
					background: `
              radial-gradient(circle at 15% 20%, ${hexToRgba(accentColor, 0.18)} 0%, transparent 45%),
              radial-gradient(circle at 85% 80%, ${hexToRgba(accentColor, 0.1)} 0%, transparent 45%)
            `,
					display: "flex",
					inset: "0",
					position: "absolute",
				}}
			/>
			<div
				style={{
					alignItems: "center",
					borderBottom: `1px solid ${borderColor}`,
					display: "flex",
					justifyContent: "space-between",
					paddingBottom: "32px",
					position: "relative",
					zIndex: "10",
				}}
			>
				<div
					style={{
						color: fgColor,
						display: "flex",
						fontSize: 18,
						letterSpacing: "0.28em",
						textTransform: "uppercase",
					}}
				>
					stormej.me
				</div>
				{kicker && (
					<div
						style={{
							color: accentColor,
							display: "flex",
							fontSize: 16,
							letterSpacing: "0.28em",
							textTransform: "uppercase",
						}}
					>
						· {kicker}
					</div>
				)}
			</div>
			<div
				style={{
					display: "flex",
					flex: 1,
					flexDirection: "column",
					justifyContent: "center",
					paddingRight: "40px",
					position: "relative",
					zIndex: "10",
				}}
			>
				<div
					style={{
						color: fgColor,
						display: "flex",
						fontFamily: "Instrument Serif",
						fontSize: headlineFontSize(headline),
						fontStyle: "italic",
						letterSpacing: "-0.02em",
						lineHeight: 1.05,
						maxWidth: "1000px",
					}}
				>
					{headline}
				</div>
				{metaText && (
					<div
						style={{
							color: mutedColor,
							display: "flex",
							fontSize: 22,
							letterSpacing: "0.12em",
							marginTop: "32px",
							maxWidth: "900px",
							textTransform: "uppercase",
						}}
					>
						{metaText}
					</div>
				)}
			</div>
			<div
				style={{
					alignItems: "center",
					borderTop: `1px solid ${borderColor}`,
					display: "flex",
					justifyContent: "space-between",
					paddingTop: "32px",
					position: "relative",
					zIndex: "10",
				}}
			>
				<div style={{ alignItems: "center", display: "flex", gap: "16px" }}>
					<div
						style={{
							backgroundColor: accentColor,
							display: "flex",
							height: "3px",
							width: "32px",
						}}
					/>
					<div
						style={{
							color: fgColor,
							display: "flex",
							fontSize: 18,
							letterSpacing: "0.16em",
							textTransform: "uppercase",
						}}
					>
						{byline}
					</div>
				</div>
				<div
					style={{
						color: mutedColor,
						display: "flex",
						fontSize: 14,
						letterSpacing: "0.24em",
						textTransform: "uppercase",
					}}
				>
					stormej.me
				</div>
			</div>
		</div>,
		{
			fonts: [
				{
					data: serifBuf,
					name: "Instrument Serif",
					style: "italic",
					weight: 400,
				},
				{ data: monoBuf, name: "Space Mono", style: "normal", weight: 400 },
			],
			height: 630,
			width: 1200,
		}
	);
}

// ---------- Variant: mono (terminal-style, all mono) ----------
async function renderMono(opts: RenderOgOptions) {
	const { headline, kicker, metaText, byline } = compute(opts);
	const bgColor = "#0E1116";
	const fgColor = "#F2EFE9";
	const mutedColor = "#7A7E83";
	const accentColor = "#A78BFA";
	const promptColor = "#5EE2A0";

	const promptKind = (opts.kind === "home" ? "" : opts.kind) || "";
	const promptPath = promptKind ? `~/${promptKind}` : "~";

	const monoText = `${promptPath} stormej $ cat${headline}${kicker ?? ""}${metaText ?? ""}${byline}—— stormej.me`;
	const monoBoldText = `${promptPath} stormej${headline}`;

	const [monoBuf, monoBold] = await Promise.all([
		loadGoogleFont("Space+Mono", monoText, 400, false),
		loadGoogleFont("Space+Mono", monoBoldText, 700, false),
	]);

	return new ImageResponse(
		<div
			style={{
				backgroundColor: bgColor,
				color: fgColor,
				display: "flex",
				flexDirection: "column",
				fontFamily: "Space Mono",
				height: "100%",
				overflow: "hidden",
				padding: "72px 88px",
				position: "relative",
				width: "100%",
			}}
		>
			<div
				style={{
					backgroundImage: `linear-gradient(${hexToRgba(fgColor, 0.04)} 1px, transparent 1px)`,
					backgroundSize: "100% 24px",
					display: "flex",
					inset: "0",
					position: "absolute",
				}}
			/>
			{/* terminal prompt */}
			<div
				style={{
					alignItems: "center",
					color: mutedColor,
					display: "flex",
					fontSize: 22,
					gap: "16px",
					position: "relative",
					zIndex: "10",
				}}
			>
				<div style={{ color: promptColor, display: "flex", fontWeight: 700 }}>
					{promptPath}
				</div>
				<div style={{ color: fgColor, display: "flex", fontWeight: 700 }}>
					stormej
				</div>
				<div style={{ color: mutedColor, display: "flex" }}>$ cat</div>
			</div>
			<div
				style={{
					display: "flex",
					flex: 1,
					flexDirection: "column",
					justifyContent: "center",
					paddingTop: "24px",
					position: "relative",
					zIndex: "10",
				}}
			>
				<div
					style={{
						color: fgColor,
						display: "flex",
						fontSize: headlineFontSizeSans(headline),
						fontWeight: 700,
						letterSpacing: "-0.02em",
						lineHeight: 1.15,
						maxWidth: "1050px",
					}}
				>
					{headline}
				</div>
				{metaText && (
					<div
						style={{
							color: accentColor,
							display: "flex",
							fontSize: 22,
							marginTop: "32px",
							maxWidth: "950px",
						}}
					>
						# {metaText}
					</div>
				)}
			</div>
			<div
				style={{
					alignItems: "center",
					color: mutedColor,
					display: "flex",
					fontSize: 16,
					justifyContent: "space-between",
					position: "relative",
					zIndex: "10",
				}}
			>
				<div style={{ color: mutedColor, display: "flex" }}>—— stormej.me</div>
				<div style={{ color: fgColor, display: "flex" }}>{byline}</div>
			</div>
		</div>,
		{
			fonts: [
				{ data: monoBuf, name: "Space Mono", style: "normal", weight: 400 },
				{ data: monoBold, name: "Space Mono", style: "normal", weight: 700 },
			],
			height: 630,
			width: 1200,
		}
	);
}

// ---------- Variant: minimal (huge centered serif, tons of whitespace) ----------
async function renderMinimal(opts: RenderOgOptions) {
	const { headline, kicker, metaText, byline } = compute(opts);
	const bgColor = "#FAFAF7";
	const fgColor = "#2A2E33";
	const mutedColor = "#7A7E83";
	const accentColor = "#6B5BFF";

	const monoText = `${kicker ?? ""}${metaText ?? ""}${byline}stormej.me`;
	const [serifBuf, monoBuf] = await Promise.all([
		loadGoogleFont("Instrument+Serif", headline, 400, true),
		loadGoogleFont("Space+Mono", monoText, 400, false),
	]);

	return new ImageResponse(
		<div
			style={{
				backgroundColor: bgColor,
				color: fgColor,
				display: "flex",
				flexDirection: "column",
				fontFamily: "Space Mono",
				height: "100%",
				overflow: "hidden",
				padding: "72px 96px",
				position: "relative",
				width: "100%",
			}}
		>
			{/* tiny kicker top-left */}
			<div
				style={{
					alignItems: "center",
					display: "flex",
					gap: "12px",
					position: "relative",
					zIndex: "10",
				}}
			>
				<div
					style={{
						backgroundColor: accentColor,
						display: "flex",
						height: "2px",
						width: "24px",
					}}
				/>
				{kicker ? (
					<div
						style={{
							color: mutedColor,
							display: "flex",
							fontSize: 16,
							letterSpacing: "0.3em",
							textTransform: "uppercase",
						}}
					>
						{kicker}
					</div>
				) : (
					<div
						style={{
							color: mutedColor,
							display: "flex",
							fontSize: 16,
							letterSpacing: "0.3em",
							textTransform: "uppercase",
						}}
					>
						stormej.me
					</div>
				)}
			</div>

			{/* big centered serif */}
			<div
				style={{
					alignItems: "center",
					display: "flex",
					flex: 1,
					flexDirection: "column",
					justifyContent: "center",
					padding: "0 40px",
					position: "relative",
					textAlign: "center",
					zIndex: "10",
				}}
			>
				<div
					style={{
						color: fgColor,
						display: "flex",
						fontFamily: "Instrument Serif",
						fontSize:
							headline.length > 50 ? 84 : headline.length > 28 ? 108 : 140,
						fontStyle: "italic",
						letterSpacing: "-0.025em",
						lineHeight: 1.0,
						maxWidth: "1050px",
						textAlign: "center",
					}}
				>
					{headline}
				</div>
				{metaText && (
					<div
						style={{
							color: mutedColor,
							display: "flex",
							fontSize: 18,
							letterSpacing: "0.2em",
							marginTop: "40px",
							textTransform: "uppercase",
						}}
					>
						{metaText}
					</div>
				)}
			</div>

			{/* small byline bottom-right */}
			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					position: "relative",
					zIndex: "10",
				}}
			>
				<div
					style={{
						color: fgColor,
						display: "flex",
						fontSize: 16,
						letterSpacing: "0.24em",
						textTransform: "uppercase",
					}}
				>
					— {byline}
				</div>
			</div>
		</div>,
		{
			fonts: [
				{
					data: serifBuf,
					name: "Instrument Serif",
					style: "italic",
					weight: 400,
				},
				{ data: monoBuf, name: "Space Mono", style: "normal", weight: 400 },
			],
			height: 630,
			width: 1200,
		}
	);
}
