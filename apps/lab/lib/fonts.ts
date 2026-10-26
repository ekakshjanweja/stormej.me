import {
	Anton,
	Geist,
	Geist_Mono,
	Instrument_Serif,
	Inter_Tight,
} from "next/font/google";

/* the same three faces as stormej.me: geist for reading, geist mono for
   labels, instrument serif for anything that should feel written */
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
});
const instrumentSerif = Instrument_Serif({
	style: ["italic", "normal"],
	subsets: ["latin"],
	variable: "--font-instrument-serif",
	weight: "400",
});

/** put on <html> in every root layout */
export const fontVariables = `${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`;

/* strip's two type styles: instrument serif (above), or inter tight, a
   neo-grotesk standing in for the reference's neue montreal, with anton
   for its one big shout */
const interTight = Inter_Tight({
	style: ["normal", "italic"],
	subsets: ["latin"],
	variable: "--font-inter-tight",
});
/* heavy and condensed, standing in for the reference's fk screamer */
const anton = Anton({
	preload: false,
	subsets: ["latin"],
	variable: "--font-anton",
	weight: "400",
});

/** strip's root layout: the shared faces plus every display style */
export const stripFontVariables = [
	fontVariables,
	interTight.variable,
	anton.variable,
].join(" ");
