import {
	EB_Garamond,
	Geist,
	Geist_Mono,
	Handjet,
	Instrument_Serif,
	Space_Mono,
} from "next/font/google";

const geistSans = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
});

const spaceMono = Space_Mono({
	style: ["italic", "normal"],
	subsets: ["latin"],
	variable: "--font-space-mono",
	weight: ["400", "700"],
});

const ebGaramond = EB_Garamond({
	subsets: ["latin"],
	variable: "--font-garamond",
	weight: ["400", "500"],
});

const handjet = Handjet({
	subsets: ["latin"],
	variable: "--font-handjet",
	weight: ["400", "500"],
});

const instrumentSerif = Instrument_Serif({
	style: ["italic", "normal"],
	subsets: ["latin"],
	variable: "--font-instrument-serif",
	weight: ["400"],
});

export const fontVariables = [
	geistSans,
	geistMono,
	spaceMono,
	ebGaramond,
	handjet,
	instrumentSerif,
]
	.map((font) => font.variable)
	.join(" ");
