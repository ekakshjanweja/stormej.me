import type { Metadata, Viewport } from "next";
import { SoundEffects } from "@/components/sfx";
import { stripFontVariables } from "@/lib/fonts";
import { Shell } from "./strip/_components/shell";
import { THEME_GATE } from "./strip/_lib/themes";
import "./strip/strip.css";
import "./strip/blend.css";
import "./strip/pages.css";
import "./strip/reading.css";
import "./strip/home-more.css";
import "./strip/micro.css";
import "./strip/themes.css";
import "./strip/texture.css";
import "./strip/type.css";
import "./strip/images.css";

export const metadata: Metadata = {
	description:
		"early-stage engineer building products from idea to production. an experiment: a portfolio that runs sideways.",
	robots: { follow: false, index: false },
	title: "ekaksh janweja · strip",
};

export const viewport: Viewport = {
	themeColor: "#f7f2ef",
};

/* runs before first paint, so a repeat visit (or reduced motion) never
   flashes the preloader */
const PRELOADER_GATE = `try{if(sessionStorage.getItem("strip:preloader-seen")!==null||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.preloaderSeen=""}}catch(e){}`;

export default function StripLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={stripFontVariables} lang="en" suppressHydrationWarning>
			<head>
				<noscript>
					<style>
						{
							".progressive-full{opacity:1!important}.progressive-preview{display:none}"
						}
					</style>
				</noscript>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed, inline gate that has to run before paint
					dangerouslySetInnerHTML={{ __html: `${THEME_GATE}${PRELOADER_GATE}` }}
				/>
			</head>
			<body>
				<SoundEffects theme="strip">
					<Shell>{children}</Shell>
				</SoundEffects>
			</body>
		</html>
	);
}
