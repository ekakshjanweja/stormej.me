import { ImageResponse } from "next/og";

export const runtime = "edge";

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const text = title ? `stormej • ${title}` : "stormej";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#262626",
          fontFamily: "Geist Mono",
          padding: "0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Grid Pattern */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            backgroundImage: `
              linear-gradient(rgba(115, 115, 115, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(115, 115, 115, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            background: `
              radial-gradient(circle at 30% 20%, rgba(115, 115, 115, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(115, 115, 115, 0.04) 0%, transparent 50%)
            `,
          }}
        />

        {/* Main Content Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 10,
            padding: "40px",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Main Title */}
          <h1
            style={{
              fontSize: 48,
              color: "#f5f5f5",
              margin: 0,
              lineHeight: 1,
              fontWeight: "600",
              letterSpacing: "-0.025em",
              textShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              marginBottom: "20px",
            }}
          >
            {text}
          </h1>

          {/* Tagline */}
          <div
            style={{
              fontSize: 16,
              color: "#a3a3a3",
              fontWeight: "400",
              letterSpacing: "0.05em",
              marginBottom: "24px",
            }}
          >
            engineer • builder • creator
          </div>

          {/* Bottom decorative line */}
          <div
            style={{
              width: "80px",
              height: "2px",
              background: "linear-gradient(90deg, transparent, #737373, transparent)",
              borderRadius: "1px",
            }}
          />
        </div>

        {/* Profile Image */}
        <img
          src="https://www.stormej.me/stormej.png"
          alt="Profile"
          style={{
            position: "absolute",
            bottom: "24px",
            right: "24px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            border: "3px solid #404040",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(115, 115, 115, 0.2)",
            zIndex: 20,
          }}
        />

        {/* Corner Accent */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "120px",
            height: "120px",
            background: "linear-gradient(135deg, rgba(115, 115, 115, 0.06) 0%, transparent 70%)",
          }}
        />

        {/* Bottom right accent */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: "180px",
            height: "120px",
            background: "linear-gradient(315deg, rgba(115, 115, 115, 0.04) 0%, transparent 60%)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Geist Mono",
          data: await loadGoogleFont("Geist Mono", text),
          style: "normal",
        },
      ],
    }
  );
}
