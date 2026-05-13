import { ImageResponse } from "next/og";

export type OgKind = "home" | "blog" | "projects" | "gear" | "work";
export type OgVariant = "editorial" | "dark" | "mono" | "minimal";

const KIND_LABEL: Record<OgKind, string | null> = {
  home: null,
  blog: "writing",
  projects: "projects",
  gear: "gear",
  work: "work",
};

async function loadGoogleFont(family: string, text: string, weight = 400, italic = false) {
  const axis = italic ? ":ital,wght@1," : ":wght@";
  const url = `https://fonts.googleapis.com/css2?family=${family}${axis}${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!resource) throw new Error(`failed to resolve font URL for ${family}`);
  const response = await fetch(resource[1]);
  if (response.status !== 200) throw new Error(`failed to load font data for ${family}`);
  return await response.arrayBuffer();
}

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface RenderOgOptions {
  kind: OgKind;
  title?: string | null;
  meta?: string | null;
  variant?: OgVariant | null;
}

interface Computed {
  headline: string;
  kicker: string | null;
  metaText: string | null;
  byline: string;
}

function compute({ kind, title, meta }: RenderOgOptions): Computed {
  const headline = title || "ekaksh janweja";
  const kicker = KIND_LABEL[kind];
  const metaText = meta?.trim() || null;
  const headlineIsName = /ekaksh\s+janweja/i.test(headline);
  const byline = headlineIsName ? "stormej" : "ekaksh janweja";
  return { headline, kicker, metaText, byline };
}

export async function renderOg(opts: RenderOgOptions) {
  const variant = opts.variant ?? "editorial";
  switch (variant) {
    case "dark":
      return renderDark(opts);
    case "mono":
      return renderMono(opts);
    case "minimal":
      return renderMinimal(opts);
    case "editorial":
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
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: bgColor,
          fontFamily: "Space Mono",
          padding: "72px 96px",
          position: "relative",
          overflow: "hidden",
          color: fgColor,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: "0",
            backgroundImage: `
              linear-gradient(${hexToRgba(fgColor, 0.04)} 1px, transparent 1px),
              linear-gradient(90deg, ${hexToRgba(fgColor, 0.04)} 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: "10",
          }}
        >
          <div style={{ display: "flex", fontSize: 18, letterSpacing: "0.16em", color: fgColor }}>
            stormej
          </div>
          {kicker && (
            <div style={{ display: "flex", fontSize: 18, letterSpacing: "0.16em", color: mutedColor }}>
              {kicker}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", position: "relative", zIndex: "10", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Instrument Serif",
              fontStyle: "italic",
              fontSize: headline.length > 50 ? 76 : headline.length > 28 ? 96 : 120,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: fgColor,
              maxWidth: "1000px",
            }}
          >
            {headline}
          </div>
          {metaText && (
            <div style={{ display: "flex", marginTop: "32px", fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", color: mutedColor, maxWidth: "900px" }}>
              {metaText}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Instrument Serif", data: serifBuf, style: "italic", weight: 400 },
        { name: "Space Mono", data: monoBuf, style: "normal", weight: 400 },
      ],
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

  const monoText = `STORMEJ.ME${kicker ?? ""}${metaText ?? ""}${byline}MOBILE DEV · LIFE ENJOYER`;
  const [serifBuf, monoBuf] = await Promise.all([
    loadGoogleFont("Instrument+Serif", headline, 400, true),
    loadGoogleFont("Space+Mono", monoText, 400, false),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: bgColor,
          fontFamily: "Space Mono",
          padding: "80px 96px",
          position: "relative",
          overflow: "hidden",
          color: fgColor,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: "0",
            background: `
              radial-gradient(circle at 15% 20%, ${hexToRgba(accentColor, 0.18)} 0%, transparent 45%),
              radial-gradient(circle at 85% 80%, ${hexToRgba(accentColor, 0.1)} 0%, transparent 45%)
            `,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: "10",
            paddingBottom: "32px",
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ display: "flex", fontSize: 18, letterSpacing: "0.28em", textTransform: "uppercase", color: fgColor }}>
            stormej.me
          </div>
          {kicker && (
            <div style={{ display: "flex", fontSize: 16, letterSpacing: "0.28em", textTransform: "uppercase", color: accentColor }}>
              · {kicker}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", position: "relative", zIndex: "10", flex: 1, justifyContent: "center", paddingRight: "40px" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Instrument Serif",
              fontStyle: "italic",
              fontSize: headline.length > 50 ? 76 : headline.length > 28 ? 96 : 120,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: fgColor,
              maxWidth: "1000px",
            }}
          >
            {headline}
          </div>
          {metaText && (
            <div style={{ display: "flex", marginTop: "32px", fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", color: mutedColor, maxWidth: "900px" }}>
              {metaText}
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: "10", paddingTop: "32px", borderTop: `1px solid ${borderColor}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", width: "32px", height: "3px", backgroundColor: accentColor }} />
            <div style={{ display: "flex", fontSize: 18, letterSpacing: "0.16em", textTransform: "uppercase", color: fgColor }}>
              {byline}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 14, letterSpacing: "0.24em", textTransform: "uppercase", color: mutedColor }}>
            mobile dev · life enjoyer
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Instrument Serif", data: serifBuf, style: "italic", weight: 400 },
        { name: "Space Mono", data: monoBuf, style: "normal", weight: 400 },
      ],
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
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: bgColor,
          fontFamily: "Space Mono",
          padding: "72px 88px",
          position: "relative",
          overflow: "hidden",
          color: fgColor,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: "0",
            backgroundImage: `linear-gradient(${hexToRgba(fgColor, 0.04)} 1px, transparent 1px)`,
            backgroundSize: "100% 24px",
          }}
        />
        {/* terminal prompt */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            position: "relative",
            zIndex: "10",
            fontSize: 22,
            color: mutedColor,
          }}
        >
          <div style={{ display: "flex", color: promptColor, fontWeight: 700 }}>
            {promptPath}
          </div>
          <div style={{ display: "flex", color: fgColor, fontWeight: 700 }}>stormej</div>
          <div style={{ display: "flex", color: mutedColor }}>$ cat</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", position: "relative", zIndex: "10", flex: 1, justifyContent: "center", paddingTop: "24px" }}>
          <div
            style={{
              display: "flex",
              fontSize: headline.length > 50 ? 48 : headline.length > 28 ? 60 : 80,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: fgColor,
              maxWidth: "1050px",
              fontWeight: 700,
            }}
          >
            {headline}
          </div>
          {metaText && (
            <div
              style={{
                display: "flex",
                marginTop: "32px",
                fontSize: 22,
                color: accentColor,
                maxWidth: "950px",
              }}
            >
              # {metaText}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: "10",
            fontSize: 16,
            color: mutedColor,
          }}
        >
          <div style={{ display: "flex", color: mutedColor }}>—— stormej.me</div>
          <div style={{ display: "flex", color: fgColor }}>{byline}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Space Mono", data: monoBuf, style: "normal", weight: 400 },
        { name: "Space Mono", data: monoBold, style: "normal", weight: 700 },
      ],
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
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: bgColor,
          fontFamily: "Space Mono",
          padding: "72px 96px",
          position: "relative",
          overflow: "hidden",
          color: fgColor,
        }}
      >
        {/* tiny kicker top-left */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "relative",
            zIndex: "10",
          }}
        >
          <div style={{ display: "flex", width: "24px", height: "2px", backgroundColor: accentColor }} />
          {kicker ? (
            <div style={{ display: "flex", fontSize: 16, letterSpacing: "0.3em", textTransform: "uppercase", color: mutedColor }}>
              {kicker}
            </div>
          ) : (
            <div style={{ display: "flex", fontSize: 16, letterSpacing: "0.3em", textTransform: "uppercase", color: mutedColor }}>
              stormej.me
            </div>
          )}
        </div>

        {/* big centered serif */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
            zIndex: "10",
            flex: 1,
            padding: "0 40px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Instrument Serif",
              fontStyle: "italic",
              fontSize: headline.length > 50 ? 84 : headline.length > 28 ? 108 : 140,
              lineHeight: 1.0,
              letterSpacing: "-0.025em",
              color: fgColor,
              maxWidth: "1050px",
              textAlign: "center",
            }}
          >
            {headline}
          </div>
          {metaText && (
            <div
              style={{
                display: "flex",
                marginTop: "40px",
                fontSize: 18,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: mutedColor,
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
          <div style={{ display: "flex", fontSize: 16, letterSpacing: "0.24em", textTransform: "uppercase", color: fgColor }}>
            — {byline}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Instrument Serif", data: serifBuf, style: "italic", weight: 400 },
        { name: "Space Mono", data: monoBuf, style: "normal", weight: 400 },
      ],
    }
  );
}
