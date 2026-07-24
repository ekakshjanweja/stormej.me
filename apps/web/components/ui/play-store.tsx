"use client";

interface PlayStoreProps extends React.SVGProps<SVGSVGElement> {
	size?: number;
}

export function PlayStore({ size = 140, ...props }: PlayStoreProps) {
	return (
		<svg
			height={size}
			viewBox="0 -0.5 408 467.8"
			width={size}
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<linearGradient
				gradientUnits="userSpaceOnUse"
				id="playStoreGreen"
				x2="261.746"
				y1="112.094"
				y2="112.094"
			>
				<stop offset="0" stopColor="#63be6b" />
				<stop offset="0.506" stopColor="#5bbc6a" />
				<stop offset="1" stopColor="#4ab96a" />
			</linearGradient>
			<linearGradient
				gradientUnits="userSpaceOnUse"
				id="playStoreBlue"
				x1="0.152"
				x2="179.896"
				y1="223.393"
				y2="223.393"
			>
				<stop offset="0" stopColor="#3ec6f2" />
				<stop offset="1" stopColor="#45afe3" />
			</linearGradient>
			<linearGradient
				gradientUnits="userSpaceOnUse"
				id="playStoreYellow"
				x1="179.896"
				x2="407.976"
				y1="229.464"
				y2="229.464"
			>
				<stop offset="0" stopColor="#faa51a" />
				<stop offset="0.387" stopColor="#fab716" />
				<stop offset="0.741" stopColor="#fac412" />
				<stop offset="1" stopColor="#fac80f" />
			</linearGradient>
			<linearGradient
				gradientUnits="userSpaceOnUse"
				id="playStoreRed"
				x1="1.744"
				x2="272.296"
				y1="345.521"
				y2="345.521"
			>
				<stop offset="0" stopColor="#ec3b50" />
				<stop offset="1" stopColor="#e7515b" />
			</linearGradient>
			<path
				d="M261.7 142.3L15 1.3C11.9-.5 8-.4 5 1.4c-3.1 1.8-5 5-5 8.6 0 0 .1 13 .2 34.4l179.7 179.7z"
				fill="url(#playStoreGreen)"
			/>
			<path
				d="M.2 44.4C.5 121.6 1.4 309 1.8 402.3L180 224.1z"
				fill="url(#playStoreBlue)"
			/>
			<path
				d="M402.9 223l-141.2-80.7-81.9 81.8 92.4 92.4L403 240.3c3.1-1.8 5-5.1 5-8.6 0-3.6-2-6.9-5.1-8.7z"
				fill="url(#playStoreYellow)"
			/>
			<path
				d="M1.7 402.3c.2 33.3.3 54.6.3 54.6 0 3.6 1.9 6.9 5 8.6 3.1 1.8 6.9 1.8 10 0l255.3-148.9-92.4-92.4z"
				fill="url(#playStoreRed)"
			/>
		</svg>
	);
}
