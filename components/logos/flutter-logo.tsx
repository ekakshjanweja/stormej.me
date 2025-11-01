interface LogoProps {
  opacity?: number;
  size?: number;
}

export function FlutterLogo({ opacity = 0.15, size = 24 }: LogoProps) {
  const height = (size * 317) / 256; // Maintain aspect ratio

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${height}px`,
        opacity: opacity,
        display: "flex",
      }}
    >
      <svg
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 256 317"
        width={size}
        height={height}
      >
        <path
          fill="#47C5FB"
          d="M158 0 0 158l49 48L255 0zM157 145l-85 85 49 50 49-49 85-86z"
        />
        <path fill="#00569E" d="m121 280 37 37h97l-85-86z" />
        <path fill="#00B5F8" d="m72 230 48-48 50 49-49 49z" />
      </svg>
    </div>
  );
}
