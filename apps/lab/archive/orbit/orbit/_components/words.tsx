/* a line split into words, each in its own mask so it can rise into place
   when its block is revealed. --i staggers them */

interface WordsProps {
	/** where this line's stagger starts, to chain lines together */
	start?: number;
	text: string;
}

export function Words({ start = 0, text }: WordsProps) {
	const words = text.split(" ").map((word, place, all) => ({
		id: `${place}-${word}`,
		index: start + place,
		last: place === all.length - 1,
		word,
	}));
	return (
		<>
			{words.map(({ id, index, last, word }) => (
				<span key={id}>
					<span className="word-mask">
						<span style={{ "--i": index } as React.CSSProperties}>{word}</span>
					</span>
					{last ? null : " "}
				</span>
			))}
		</>
	);
}

/** how many words a line has, for chaining staggers */
export const wordCount = (text: string) => text.split(" ").length;

interface LineProps {
	/** the words before the marked one */
	before: string;
	/** colours the underline; defaults to the page's world */
	color?: string;
	/** the closing mark */
	end?: string;
	/** the word that gets the underline */
	word: string;
}

/** a page's big line, ending on an underlined word, like the home's sentence */
export function Line({ before, color, end = ".", word }: LineProps) {
	const start = wordCount(before);
	return (
		<p className="band-line">
			<Words text={before} />{" "}
			<span
				className="band-word"
				style={
					color ? ({ "--world": color } as React.CSSProperties) : undefined
				}
			>
				<span className="word-mask">
					<span style={{ "--i": start } as React.CSSProperties}>{word}</span>
				</span>
				<span aria-hidden="true" className="band-underline" />
			</span>
			<span className="word-mask">
				<span style={{ "--i": start + 1 } as React.CSSProperties}>{end}</span>
			</span>
		</p>
	);
}
