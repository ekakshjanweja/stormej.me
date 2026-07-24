export function Highlights({
	title,
	items,
	bullet = "•",
}: {
	title?: string;
	items: string[];
	bullet?: string;
}) {
	if (!items || items.length === 0) {
		return null;
	}
	return (
		<section className="my-10">
			{title && <h2 className="section-label mb-5">{title}</h2>}
			<ul className="list-none space-y-3 pl-0">
				{items.map((item, i) => (
					<li
						className="flex items-start gap-3 font-light text-[14px] text-foreground leading-[1.6]"
						key={i}
					>
						<span className="mt-[2px] select-none text-[12px] text-muted-foreground">
							{bullet}
						</span>
						<span>{item}</span>
					</li>
				))}
			</ul>
		</section>
	);
}
