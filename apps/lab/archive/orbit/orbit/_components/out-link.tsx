/* a link that leaves orbit: a new tab, no opener, and it says so to screen
   readers */

interface OutLinkProps {
	children: React.ReactNode;
	className?: string;
	/** what the cursor pill says */
	cursor?: string;
	href: string;
	/** read after the link text */
	note?: string;
}

export function OutLink({
	children,
	className,
	cursor,
	href,
	note = "(opens in a new tab)",
}: OutLinkProps) {
	return (
		<a
			className={className}
			data-cursor={cursor}
			href={href}
			rel="noopener noreferrer"
			target="_blank"
		>
			{children}
			<span className="sr-only"> {note}</span>
		</a>
	);
}
