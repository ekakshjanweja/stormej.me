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
          backgroundColor: "#0a0a0a",
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
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Animated Gradient Background */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            background: `
              radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(147, 51, 234, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.04) 0%, transparent 50%)
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
            padding: "60px",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Main Title */}
          <h1
            style={{
              fontSize: 56,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.1,
              fontWeight: "700",
              letterSpacing: "-0.02em",
              textShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              marginBottom: "32px",
              background: "linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {text}
          </h1>

          {/* Decorative accent line */}
          <div
            style={{
              width: "120px",
              height: "3px",
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981)",
              borderRadius: "2px",
              marginBottom: "24px",
            }}
          />
        </div>

        {/* Profile Image with enhanced styling */}
        <img
          src="https://www.stormej.me/stormej.png"
          alt="Profile"
          style={{
            position: "absolute",
            bottom: "32px",
            right: "32px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            border: "4px solid rgba(255, 255, 255, 0.1)",
            boxShadow:
              "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            zIndex: 20,
          }}
        />

        {/* Top left accent */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
          }}
        />

        {/* Bottom right accent */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: "250px",
            height: "200px",
            background:
              "radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)",
          }}
        />

        {/* Floating particles effect */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "15%",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.6)",
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "60%",
            left: "10%",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "rgba(147, 51, 234, 0.6)",
            boxShadow: "0 0 24px rgba(147, 51, 234, 0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "20%",
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.6)",
            boxShadow: "0 0 16px rgba(16, 185, 129, 0.4)",
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
