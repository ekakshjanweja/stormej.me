import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A picture-first card: a tinted media panel with the name and one line of
 * context underneath. The media does the explaining, the text just labels it.
 */
export function ShowcaseCard({
	href,
	external,
	onClick,
	accent,
	media,
	title,
	meta,
	detail,
	aspectClassName = "aspect-[4/3]",
	className,
}: {
	href: string;
	external?: boolean;
	onClick?: () => void;
	/** css colour behind the media; falls back to the muted surface */
	accent?: string;
	media: ReactNode;
	title: string;
	meta?: ReactNode;
	/** a quieter second line under the meta, e.g. dates */
	detail?: ReactNode;
	aspectClassName?: string;
	className?: string;
}) {
	return (
		<Link
			className={cn(
				"showcase-card group flex flex-col gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
				className
			)}
			href={href}
			onClick={onClick}
			rel={external ? "noopener noreferrer" : undefined}
			target={external ? "_blank" : undefined}
		>
			<div
				className={cn(
					"showcase-card__media relative isolate overflow-hidden rounded-xl border border-border/60 bg-muted",
					aspectClassName
				)}
				style={
					accent ? ({ "--card-accent": accent } as CSSProperties) : undefined
				}
			>
				{media}
			</div>
			<div className="flex items-start justify-between gap-3 px-0.5">
				<div className="flex min-w-0 flex-col gap-0.5">
					<span className="link-underline-hover truncate font-medium text-[14px] text-foreground">
						{title}
					</span>
					{meta ? (
						<span className="line-clamp-1 font-light text-[12px] text-muted-foreground leading-snug">
							{meta}
						</span>
					) : null}
					{detail ? <span className="meta-tag">{detail}</span> : null}
				</div>
				{external ? (
					<ArrowUpRight
						aria-hidden
						className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
					/>
				) : null}
			</div>
		</Link>
	);
}
