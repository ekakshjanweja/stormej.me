import { ArrowUpRight } from "lucide-react";

interface LinkItem {
	href: string;
	label: string;
}

export function Links({
	title,
	items,
}: {
	title?: string;
	items?: LinkItem[];
}) {
	if (!items || items.length === 0) {
		return null;
	}
	return (
		<section className="my-6 space-y-3">
			{title && <h3 className="headline text-[18px]">{title}</h3>}
			<div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
				{items.map((item) => (
					<a
						className="hover-dim inline-flex items-center gap-1 text-foreground"
						href={item.href}
						key={item.href}
						rel="noopener noreferrer"
						target="_blank"
					>
						{item.label} <ArrowUpRight className="h-3 w-3" />
					</a>
				))}
			</div>
		</section>
	);
}
