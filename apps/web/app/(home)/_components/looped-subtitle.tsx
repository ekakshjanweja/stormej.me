import { HighlightedText } from "@/components/styles/highlighted-text";
import { TextLoop } from "@/components/ui/text-loop";
import { valorant } from "@/lib/constants/links";

const items = [
	{
		label: "i-use-arch-btw",
		link: "https://github.com/ekakshjanweja/dotfiles",
	},
	{
		altText: "(shift + v)",
		label: "valorant",
		link: valorant,
	},
	{
		altText: "(seedhe-maut)",
		label: "music",
	},
	{
		label: "engineering",
	},
	{ label: "keebs" },
];

export default function LoopedSubtitle() {
	return (
		<>
			<div className="flex flex-col items-start justify-start md:flex-row md:items-center md:justify-start md:space-x-4">
				<p className="opacity-80">{"i am obsessed with"}</p>
				<TextLoop
					className="font-semibold text-base text-foreground leading-6"
					interval={3.5}
					transition={{ duration: 0.3 }}
					variants={{
						animate: { opacity: 1, y: 0 },
						exit: { opacity: 0, y: -10 },
						initial: { opacity: 0, y: 10 },
					}}
				>
					{items.map((item, index) => (
						<div key={index}>
							{HighlightedText(item.label, item.link, item.altText)}
						</div>
					))}
				</TextLoop>
			</div>
		</>
	);
}
