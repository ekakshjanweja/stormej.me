/* redraws real dom text into a canvas, word by word at the exact spot the
   browser laid it out, so the shader can draw (and bend) the same text.
   the dom text stays in the page for screen readers, zoom and search */

interface WordBox {
	left: number;
	text: string;
	top: number;
}

/** every word in `element`, with the box the browser gave it */
export const wordBoxes = (element: HTMLElement): (WordBox & DOMRect)[] => {
	const boxes: (WordBox & DOMRect)[] = [];
	const range = document.createRange();
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
	let node = walker.nextNode();
	while (node) {
		const content = node.textContent ?? "";
		const pattern = /\S+/g;
		let match = pattern.exec(content);
		while (match) {
			range.setStart(node, match.index);
			range.setEnd(node, match.index + match[0].length);
			/* a word can wrap mid-way only if it's hyphenated; take the first rect */
			const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();
			boxes.push(Object.assign(DOMRect.fromRect(rect), { text: match[0] }));
			match = pattern.exec(content);
		}
		node = walker.nextNode();
	}
	return boxes;
};

/** white words on black, sized to `canvas` (a gl canvas). returns null if
    there's nothing to draw yet */
export const drawTextMask = (
	canvas: HTMLCanvasElement,
	elements: HTMLElement[]
) => {
	const bounds = canvas.getBoundingClientRect();
	if (bounds.width === 0 || canvas.width === 0) {
		return null;
	}
	const ratio = canvas.width / bounds.width;
	const mask = document.createElement("canvas");
	mask.width = canvas.width;
	mask.height = canvas.height;
	const context = mask.getContext("2d");
	if (!context) {
		return null;
	}
	context.fillStyle = "black";
	context.fillRect(0, 0, mask.width, mask.height);
	context.fillStyle = "white";
	context.textBaseline = "alphabetic";
	context.textAlign = "left";
	for (const element of elements) {
		const style = window.getComputedStyle(element);
		const size = Number.parseFloat(style.fontSize) * ratio;
		context.font = `${style.fontStyle} ${style.fontWeight} ${size}px ${style.fontFamily}`;
		const spacing = Number.parseFloat(style.letterSpacing);
		context.letterSpacing = Number.isNaN(spacing)
			? "0px"
			: `${spacing * ratio}px`;
		/* the range box is the font's content area, so its top plus the
		   font ascent is the baseline, whatever the line-height */
		const ascent = context.measureText("Hg").fontBoundingBoxAscent;
		for (const word of wordBoxes(element)) {
			const x = (word.left - bounds.left) * ratio;
			const y = (word.top - bounds.top) * ratio + ascent;
			context.fillText(word.text, x, y);
		}
	}
	return mask;
};
