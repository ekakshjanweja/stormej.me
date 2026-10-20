import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Outcome {
	href?: string;
	label: string;
	metric: string;
}

function OutcomeRow({ outcome }: { outcome: Outcome }) {
	const content = (
		<>
			<span className="headline col-start-1 row-start-1 text-[22px] text-foreground tabular-nums leading-[1.2]">
				{outcome.metric}
			</span>
			<span className="col-start-1 row-start-2 text-[14px] text-muted-foreground leading-snug sm:col-start-2 sm:row-start-1">
				{outcome.label}
			</span>
			{outcome.href ? (
				<ArrowUpRight
					aria-hidden
					className="col-start-2 row-start-1 h-3.5 w-3.5 self-center text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:col-start-3"
				/>
			) : (
				<span aria-hidden className="col-start-2 row-start-1 sm:col-start-3" />
			)}
		</>
	);
	const row =
		"grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_1rem]";

	if (outcome.href) {
		return (
			<Link
				className={`group ${row} hover-dim rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20`}
				href={outcome.href}
			>
				{content}
			</Link>
		);
	}
	return <div className={row}>{content}</div>;
}

/**
 * What a project or job came to, as a short ledger: the number large on the
 * left, what it means beside it, one row each. Rows read the same whether
 * there are two outcomes or five, and whether the metric is a number or a
 * few words. A row with a write-up links to it.
 */
export function Outcomes({
	items,
	sectionId = "outcomes",
	label = "outcomes",
}: {
	items?: Outcome[];
	sectionId?: string;
	label?: string;
}) {
	if (!items || items.length === 0) {
		return null;
	}
	return (
		<section className="mt-16 scroll-mt-32" id={sectionId}>
			<span className="meta-tag mb-2 block">{label}</span>
			<ul className="divide-y divide-border/70 border-border/70 border-y">
				{items.map((outcome) => (
					<li key={outcome.metric}>
						<OutcomeRow outcome={outcome} />
					</li>
				))}
			</ul>
		</section>
	);
}
