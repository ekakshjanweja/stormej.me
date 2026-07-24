import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MiniCard({
	text,
	href,
}: {
	text: string;
	href?: string;
}) {
	return (
		<>
			{href ? (
				<Link
					className={cn(
						"group relative inline-block px-3 py-1.5",
						"bg-highlight hover:bg-foreground",
						"rounded-md text-card text-sm",
						"opacity-95 hover:opacity-100",
						"transition-all duration-300 ease-out",
						"transform hover:scale-105",
						"shadow-sm hover:shadow-md",
						"transform-gpu",
						"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
					)}
					href={href}
					rel="noopener noreferrer"
					target="_blank"
				>
					<span className="relative z-10">{text}</span>
					{/* Subtle glow effect */}
					<div className="absolute inset-0 -z-10 rounded-md bg-highlight/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
				</Link>
			) : (
				<span className="inline-block whitespace-nowrap rounded-md bg-foreground/10 px-2 py-1 text-foreground text-sm">
					{text}
				</span>
			)}
		</>
	);
}
