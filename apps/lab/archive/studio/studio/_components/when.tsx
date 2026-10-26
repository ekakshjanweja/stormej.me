/* "2024 → 2026" with the arrow read as "to", not "right arrow" */

export function When({ value }: { value: string }) {
	const [start, end] = value.split(" → ");
	if (end === undefined) {
		return <>{value}</>;
	}
	return (
		<>
			{start}
			<span aria-hidden="true"> → </span>
			<span className="sr-only"> to </span>
			{end}
		</>
	);
}
