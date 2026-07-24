import type { Metadata } from "next";

const description = "the hardware i use day-to-day";

export const metadata: Metadata = {
	alternates: { canonical: "/gear" },
	description,
	openGraph: {
		description,
		images: [
			{
				alt: "stormej — gear",
				height: 630,
				url: "/og/gear",
				width: 1200,
			},
		],
		title: "gear | stormej",
		type: "website",
		url: "https://www.stormej.me/gear",
	},
	title: "gear",
	twitter: {
		description,
		images: ["/og/gear"],
		title: "gear | stormej",
	},
};

const gear = [
	{ label: "laptop", value: "m4 pro macbook pro base/g14'21" },
	{ label: "keyboard", value: "aula f75 pro" },
	{ label: "mouse", value: "logitech g304" },
	{ label: "pc", value: "7600-4060-32gb_ddr5" },
	{ label: "monitor", value: "gigabyte g24f2" },
	{ label: "headphones", value: "soundcore q20i" },
	{ label: "mic", value: "fifine at6" },
	{ label: "webcam", value: "lenovo 300" },
	{ label: "mobile", value: "pixel 10" },
	{ label: "typing 30s", value: "86wpm" },
];

export default function Gear() {
	return (
		<main>
			<h1 className="section-label mb-8">gear</h1>
			<ul className="flex flex-col gap-3">
				{gear.map(({ label, value }) => (
					<li
						className="flex items-baseline justify-between gap-4 border-border/40 border-b pb-3 last:border-0"
						key={label}
					>
						<span className="meta-tag">{label}</span>
						<span className="text-right font-light text-[13px] text-foreground">
							{value}
						</span>
					</li>
				))}
			</ul>
		</main>
	);
}
