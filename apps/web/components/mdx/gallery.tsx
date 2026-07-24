import Image from "next/image";
import { cn } from "@/lib/utils";

type GalleryItem =
	| string
	| { light: string; dark: string }
	| {
			src: string | { light: string; dark: string };
			alt?: string;
			caption?: string;
	  };

function normalize(item: GalleryItem) {
	if (typeof item === "string") {
		return { alt: "", caption: undefined, src: item as string };
	}
	if ("src" in item) {
		return { alt: item.alt ?? "", caption: item.caption, src: item.src };
	}
	return { alt: "", caption: undefined, src: item };
}

export function Gallery({
	items,
	columns = 2,
	className,
}: {
	items?: GalleryItem[];
	columns?: 2 | 3 | 4;
	className?: string;
}) {
	if (!items || items.length === 0) {
		return null;
	}

	const colsClass =
		columns === 4
			? "sm:grid-cols-2 md:grid-cols-4"
			: columns === 3
				? "sm:grid-cols-2 md:grid-cols-3"
				: "sm:grid-cols-2";

	return (
		<div className={cn("my-8 grid grid-cols-1 gap-4", colsClass, className)}>
			{items.map((raw) => {
				const { src, alt, caption } = normalize(raw);
				return (
					<figure
						className="space-y-2"
						key={typeof src === "string" ? src : alt}
					>
						<div className="overflow-hidden rounded-xl border border-border/40 bg-muted/[0.12]">
							{typeof src === "string" ? (
								<Image
									alt={alt}
									className="h-auto w-full object-cover"
									height={800}
									src={src}
									width={1200}
								/>
							) : (
								<>
									<Image
										alt={alt}
										className="h-auto w-full object-cover dark:hidden"
										height={800}
										src={src.light}
										width={1200}
									/>
									<Image
										alt={alt}
										className="hidden h-auto w-full object-cover dark:block"
										height={800}
										src={src.dark}
										width={1200}
									/>
								</>
							)}
						</div>
						{caption && (
							<figcaption className="font-light text-[12px] text-muted-foreground">
								{caption}
							</figcaption>
						)}
					</figure>
				);
			})}
		</div>
	);
}
