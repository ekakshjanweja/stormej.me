import Link from "next/link";

/* the way on, at the bottom of a page: a wide band that fills with the
   next place's colour as you point at it */

interface NextBandProps {
	color: string;
	href: string;
	/** small, above: "next case · 03", "keep walking" */
	kicker: string;
	/** text colour on top of `color` */
	on: string;
	sub: string;
	title: string;
}

export function NextBand({
	color,
	href,
	kicker,
	on,
	sub,
	title,
}: NextBandProps) {
	return (
		<section
			aria-labelledby="next-title"
			className="next-band"
			data-reveal="up"
			style={{ "--on": on, "--world": color } as React.CSSProperties}
		>
			<h2 className="kicker next-kicker" id="next-title">
				{kicker}
			</h2>
			<Link className="next-link" data-cursor="go" href={href}>
				<span aria-hidden="true" className="next-fill" />
				<span className="next-title">{title}</span>
				<span className="next-sub">{sub}</span>
				<i aria-hidden="true" className="next-arrow">
					→
				</i>
			</Link>
		</section>
	);
}
