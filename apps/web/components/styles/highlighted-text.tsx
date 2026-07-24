import Link from "next/link";

export const HighlightedText = (
	label: string,
	link?: string,
	altText?: string,
	className?: string
) => {
	return (
		<div
			className={`${className}flex items-center justify-center space-x-4 text-highlight`}
		>
			{link === undefined ? (
				<p>{label}</p>
			) : (
				<div className="group relative">
					<Link
						className="relative z-10 transition-all duration-300 hover:text-highlight"
						href={link}
						target={link === "/gear" ? "_parent" : "_blank"}
					>
						<p>{label}</p>
					</Link>

					{/* Gradient background effects for links */}
					<div className="absolute -inset-2 -z-10 rounded-md bg-gradient-to-r from-highlight/10 to-accent/10 opacity-0 transition-all duration-300 group-hover:opacity-100" />
					<div className="absolute -inset-1 -z-10 rounded bg-highlight/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
				</div>
			)}
			{altText && (
				<p className="font-light text-muted-foreground text-xs">{altText}</p>
			)}
		</div>
	);
};
