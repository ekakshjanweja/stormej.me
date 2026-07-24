import Image from "next/image";
import { cn } from "@/lib/utils";

type FigureSrc = string | { light: string; dark: string };

export function Figure({
	src,
	alt = "",
	caption,
	width = 1600,
	height = 1000,
	priority,
	className,
	rounded = true,
	bordered = true,
	fit = "contain",
}: {
	src: FigureSrc;
	alt?: string;
	caption?: string;
	width?: number;
	height?: number;
	priority?: boolean;
	className?: string;
	rounded?: boolean;
	bordered?: boolean;
	fit?: "contain" | "cover";
}) {
	const fitClass = fit === "cover" ? "object-cover" : "object-contain";
	const wrap = cn(
		"overflow-hidden bg-muted/[0.12]",
		rounded && "rounded-xl",
		bordered && "border border-border/40",
		className
	);

	return (
		<figure className="my-8">
			<div className={wrap}>
				{typeof src === "string" ? (
					<Image
						alt={alt}
						className={cn("h-auto w-full", fitClass)}
						height={height}
						priority={priority}
						src={src}
						width={width}
					/>
				) : (
					<>
						<Image
							alt={alt}
							className={cn("h-auto w-full dark:hidden", fitClass)}
							height={height}
							priority={priority}
							src={src.light}
							width={width}
						/>
						<Image
							alt={alt}
							className={cn("hidden h-auto w-full dark:block", fitClass)}
							height={height}
							priority={priority}
							src={src.dark}
							width={width}
						/>
					</>
				)}
			</div>
			{caption && (
				<figcaption className="mt-2 font-light text-[12px] text-muted-foreground">
					{caption}
				</figcaption>
			)}
		</figure>
	);
}
