import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ViewMore({
	title,
	subTitle,
	href,
}: {
	title: string;
	subTitle?: string;
	href?: string;
}) {
	const content = (
		<div
			className={cn(
				"group relative",
				"transition-all duration-300 ease-in-out",
				"hover:translate-x-1 focus:translate-x-1",
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
				"-m-2 rounded-lg p-2" // Padding for focus ring and hover area
			)}
		>
			<div className="relative z-10 flex items-center justify-start gap-1 text-highlight">
				<p
					className={cn(
						"transition-all duration-300 ease-in-out group-hover:underline",
						"font-medium text-sm"
					)}
				>
					{title}
				</p>
				<ArrowUpRight
					className={cn(
						"h-4 w-4",
						"group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-95",
						"transition-all duration-200 ease-in-out"
					)}
				/>
			</div>

			{subTitle && (
				<p
					className={cn(
						"relative z-10 mt-0.5 text-xs opacity-60",
						"transition-opacity duration-300 ease-in-out",
						"group-hover:opacity-80"
					)}
				>
					{subTitle}
				</p>
			)}

			{/* Gradient background effects */}
			<div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-highlight/5 to-accent/5 opacity-0 transition-all duration-300 group-hover:opacity-100" />
			<div className="absolute -inset-1 -z-20 rounded-lg bg-gradient-to-br from-highlight/10 via-transparent to-muted/10 opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100 group-hover:blur-none" />
		</div>
	);

	return href ? (
		<Link className="inline-block" href={href}>
			{content}
		</Link>
	) : (
		<div className="inline-block">{content}</div>
	);
}
