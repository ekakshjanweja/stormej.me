import {
	Archivo_Black,
	Bricolage_Grotesque,
	DM_Serif_Display,
	EB_Garamond,
	Fraunces,
	Geist,
	Geist_Mono,
	Handjet,
	IBM_Plex_Mono,
	Instrument_Serif,
	JetBrains_Mono,
	Newsreader,
	Playfair_Display,
	Space_Grotesk,
	Space_Mono,
	Syne,
	Unbounded,
	VT323,
} from "next/font/google";

// The fonts the default design uses are preloaded; the rest only download
// when a published design actually references them (lib/design/options.ts).

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

const fraunces = Fraunces({
	preload: false,
	style: ["italic", "normal"],
	subsets: ["latin"],
	variable: "--font-fraunces",
});

const playfair = Playfair_Display({
	preload: false,
	style: ["italic", "normal"],
	subsets: ["latin"],
	variable: "--font-playfair",
});

const dmSerif = DM_Serif_Display({
	preload: false,
	style: ["italic", "normal"],
	subsets: ["latin"],
	variable: "--font-dm-serif",
	weight: ["400"],
});

const newsreader = Newsreader({
	preload: false,
	style: ["italic", "normal"],
	subsets: ["latin"],
	variable: "--font-newsreader",
});

const spaceGrotesk = Space_Grotesk({
	preload: false,
	subsets: ["latin"],
	variable: "--font-space-grotesk",
});

const bricolage = Bricolage_Grotesque({
	preload: false,
	subsets: ["latin"],
	variable: "--font-bricolage",
});

const syne = Syne({
	preload: false,
	subsets: ["latin"],
	variable: "--font-syne",
});

const unbounded = Unbounded({
	preload: false,
	subsets: ["latin"],
	variable: "--font-unbounded",
});

const archivoBlack = Archivo_Black({
	preload: false,
	subsets: ["latin"],
	variable: "--font-archivo-black",
	weight: ["400"],
});

const jetbrains = JetBrains_Mono({
	preload: false,
	subsets: ["latin"],
	variable: "--font-jetbrains",
});

const plexMono = IBM_Plex_Mono({
	preload: false,
	subsets: ["latin"],
	variable: "--font-plex-mono",
	weight: ["400", "500", "600"],
});

const vt323 = VT323({
	preload: false,
	subsets: ["latin"],
	variable: "--font-vt323",
	weight: ["400"],
});

export const fontVariables = [
	geistSans,
	geistMono,
	spaceMono,
	ebGaramond,
	handjet,
	instrumentSerif,
	fraunces,
	playfair,
	dmSerif,
	newsreader,
	spaceGrotesk,
	bricolage,
	syne,
	unbounded,
	archivoBlack,
	jetbrains,
	plexMono,
	vt323,
]
	.map((font) => font.variable)
	.join(" ");
