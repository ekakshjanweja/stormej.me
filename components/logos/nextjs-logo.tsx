interface LogoProps {
  opacity?: number;
  size?: number;
}

export function NextJsLogo({ opacity = 0.15, size = 24 }: LogoProps) {
  const height = size; // Square aspect ratio

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${height}px`,
        opacity: opacity,
        display: "flex",
      }}
    >
      <svg viewBox="0 0 180 180" fill="none" width={size} height={height}>
        <defs>
          <linearGradient
            id="nextjs_icon_dark__b"
            x1="55"
            y1="178"
            x2="129"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="nextjs_icon_dark__c"
            x1="115"
            y1="142"
            x2="127"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="nextjs_icon_dark__a">
            <rect width="180" height="180" fill="#fff" rx="87" />
          </mask>
        </defs>
        <g mask="url(#nextjs_icon_dark__a)">
          <circle
            cx="90"
            cy="90"
            r="87"
            fill="black"
            stroke="white"
            strokeWidth="6"
          />
          <path
            d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
            fill="url(#nextjs_icon_dark__b)"
          />
          <rect
            x="115"
            y="54"
            width="12"
            height="72"
            fill="url(#nextjs_icon_dark__c)"
          />
        </g>
      </svg>
    </div>
  );
}
