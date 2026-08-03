import { type SVGProps, useId } from "react";
import { cn } from "@/lib/utils";

/** Screen rect inside the 200×400 viewBox — keep in sync with the paths below. */
export const IPHONE_17_PRO_SCREEN = {
	height: 374.37,
	rx: 24.62,
	width: 171.98,
	x: 14.08,
	y: 12.81,
} as const;

/** Outer device viewBox size for the 17 Pro mock. */
export const IPHONE_17_PRO_VIEWBOX = { height: 400, width: 200 } as const;

export interface Iphone17ProProps extends SVGProps<SVGSVGElement> {
	height?: number;
	/**
	 * When false, hides the Dynamic Island / camera pill. Work screenshots keep
	 * it; live demos often drop it for a cleaner status bar.
	 */
	showIsland?: boolean;
	/**
	 * When false, skips the opaque screen fill so content can show through
	 * (live demos). Bezel still paints on top.
	 */
	showScreen?: boolean;
	src?: string;
	width?: number;
}

export function Iphone17Pro({
	width,
	height,
	src,
	showIsland = true,
	showScreen = true,
	className,
	...props
}: Iphone17ProProps) {
	const clipId = `iphone17-clip-${useId().replace(/:/g, "")}`;
	const screen = IPHONE_17_PRO_SCREEN;

	return (
		<svg
			className={cn(
				!(width || height) && "h-auto w-full max-w-[min(100%,280px)]",
				"shrink-0 text-muted-foreground/30",
				className
			)}
			fill="none"
			height={height}
			viewBox={`0 0 ${IPHONE_17_PRO_VIEWBOX.width} ${IPHONE_17_PRO_VIEWBOX.height}`}
			width={width}
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>iPhone 17 Pro</title>
			<path
				d="M196.11,128.09c0-.25-.2-.45-.45-.45-.11.04-.37.03-.69,0V36.69c0-17.84-14.46-32.31-32.31-32.31H37.48C19.63,4.39,5.17,18.85,5.17,36.69v48.99c-.3.02-.55.03-.66-.02-.25,0-.45.2-.45.45,0,0,0,17.29,0,17.29-.03.41.5.49,1.11.48v13.63c-.61,0-1.14.08-1.11.48,0,0,0,28.54,0,28.54-.03.42.5.49,1.11.48v7.95c-.61,0-1.14.08-1.11.48,0,0,0,28.54,0,28.54-.03.42.5.49,1.11.48v178.86c0,17.84,14.46,32.31,32.31,32.31h125.2c17.84,0,32.31-14.46,32.31-32.31v-188.87c.32-.02.58-.03.69.04,1.26.1.03-45.94.45-46.38ZM186.07,362.63c0,13.56-10.99,24.56-24.56,24.56H38.64c-13.56,0-24.56-10.99-24.56-24.56V37.37c0-13.56,10.99-24.56,24.56-24.56h122.87c13.56,0,24.56,10.99,24.56,24.56v325.26Z"
				fill="#303333"
			/>
			<path
				d="M161.38,7.29H38.78c-16.54,0-29.95,13.41-29.95,29.95v325.52c0,16.54,13.41,29.95,29.95,29.95h122.6c16.54,0,29.95-13.41,29.95-29.95V37.24c0-16.54-13.41-29.95-29.95-29.95ZM186.07,362.57c0,13.6-11.02,24.62-24.62,24.62H38.7c-13.6,0-24.62-11.02-24.62-24.62V37.43c0-13.6,11.02-24.62,24.62-24.62h122.75c13.6,0,24.62,11.02,24.62,24.62v325.14Z"
				fill="#000000"
			/>

			{showScreen && (
				<rect
					fill="currentColor"
					height={screen.height}
					rx={screen.rx}
					ry={screen.rx}
					width={screen.width}
					x={screen.x}
					y={screen.y}
				/>
			)}
			{showScreen && src && (
				<image
					clipPath={`url(#${clipId})`}
					height={screen.height}
					href={src}
					preserveAspectRatio="xMidYMid slice"
					width={screen.width}
					x={screen.x}
					y={screen.y}
				/>
			)}
			{showIsland && (
				<>
					<path
						d="M119.61,33.86h-38.93c-10.48-.18-10.5-15.78,0-15.96,0,0,38.93,0,38.93,0,4.41,0,7.98,3.57,7.98,7.98,0,4.41-3.57,7.98-7.98,7.98Z"
						fill="#000000"
					/>
					<path
						d="M118.78,29.21c-4.32.06-4.32-6.73,0-6.66,4.32-.06,4.32,6.73,0,6.66Z"
						fill="#080d4c"
					/>
				</>
			)}

			{showScreen && (
				<defs>
					<clipPath id={clipId}>
						<rect
							fill="#ffffff"
							height={screen.height}
							rx={screen.rx}
							ry={screen.rx}
							width={screen.width}
							x={screen.x}
							y={screen.y}
						/>
					</clipPath>
				</defs>
			)}
		</svg>
	);
}
