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

  // Theme colors matching the dark theme
  // Background: oklch(0.18 0 85) ≈ #1e1e1e
  // Foreground: oklch(0.9 0.002 85) ≈ #e5e5e5
  // Highlight: oklch(0.75 0.01 75) ≈ #c0c0c0
  // Border: oklch(0.35 0.006 85) ≈ #555555
  const bgColor = "#1e1e1e";
  const fgColor = "#e5e5e5";
  const highlightColor = "#c0c0c0";
  const borderColor = "#555555";

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

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
          backgroundColor: bgColor,
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
              linear-gradient(${hexToRgba(fgColor, 0.15)} 1px, transparent 1px),
              linear-gradient(90deg, ${hexToRgba(fgColor, 0.15)} 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Subtle gradient overlay matching theme */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            background: `
              radial-gradient(circle at 20% 30%, ${hexToRgba(highlightColor, 0.15)} 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, ${hexToRgba(highlightColor, 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, ${hexToRgba(highlightColor, 0.08)} 0%, transparent 50%)
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
              color: fgColor,
              margin: 0,
              lineHeight: 1.1,
              fontWeight: "700",
              letterSpacing: "-0.02em",
              textShadow: `0 8px 32px rgba(0, 0, 0, 0.6)`,
              marginBottom: "32px",
            }}
          >
            {text}
          </h1>

          {/* Decorative accent line matching theme */}
          <div
            style={{
              width: "120px",
              height: "3px",
              background: `linear-gradient(90deg, ${highlightColor}, ${hexToRgba(fgColor, 0.8)}, ${highlightColor})`,
              borderRadius: "2px",
              marginBottom: "24px",
            }}
          />
        </div>

        {/* Profile Image with theme-appropriate styling */}
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
            border: `4px solid ${hexToRgba(borderColor, 0.8)}`,
            boxShadow: `0 12px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px ${hexToRgba(borderColor, 0.4)}`,
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
            background: `radial-gradient(circle, ${hexToRgba(highlightColor, 0.12)} 0%, transparent 70%)`,
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
            background: `radial-gradient(circle, ${hexToRgba(highlightColor, 0.1)} 0%, transparent 70%)`,
          }}
        />

        {/* Subtle floating particles matching theme */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "15%",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: hexToRgba(highlightColor, 0.8),
            boxShadow: `0 0 20px ${hexToRgba(highlightColor, 0.4)}`,
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
            background: hexToRgba(fgColor, 0.6),
            boxShadow: `0 0 24px ${hexToRgba(fgColor, 0.3)}`,
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
            background: hexToRgba(highlightColor, 0.7),
            boxShadow: `0 0 16px ${hexToRgba(highlightColor, 0.35)}`,
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
