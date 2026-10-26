/** a word as letters with stable keys, for per-letter animation */
export const letters = (text: string) =>
	[...text].map((char, position) => ({ char, key: `${position}-${char}` }));
