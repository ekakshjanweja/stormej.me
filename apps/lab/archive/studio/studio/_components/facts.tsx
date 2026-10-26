/* a short run of facts under a title. on wide screens they sit on one line
   with sage dots between them; on phones they become a two-column grid and
   the dots go, so a dot can never end up alone at the start of a line */

export function Facts({ items, label }: { items: string[]; label: string }) {
	return (
		<ul aria-label={label} className="page-facts">
			{items.map((item) => (
				<li key={item}>{item}</li>
			))}
		</ul>
	);
}
