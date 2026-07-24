import Link from "next/link";
import type { ReactNode } from "react";

export interface LabelProps {
	className?: string;
	href?: string;
	hrefText?: string;
	icon?: ReactNode;
	text: string;
}

export default function Label({
	text,
	icon,
	href,
	hrefText,
	className,
}: LabelProps) {
	return (
		<div
			className={
				className +
				"flex items-center gap-x-2 text-muted-foreground text-xs md:text-sm"
			}
		>
			{icon}
			<div className="flex items-center gap-x-4">
				<p> {text}</p>
				{href && (
					<Link href={href} target="_blank">
						<p className="transition-all duration-300 ease-in-out hover:text-highlight hover:underline">
							{hrefText}
						</p>
					</Link>
				)}
			</div>
		</div>
	);
}
