import type { Metadata, Viewport } from "next";
import { SoundEffects } from "@/components/sfx";
import { fontVariables } from "@/lib/fonts";
import { SiteFoot } from "./studio/_components/site-foot";
import { SiteHead } from "./studio/_components/site-head";
import { SmoothScroll } from "./studio/_components/smooth-scroll";
import { PageTransition } from "./studio/_components/transition";
import "./studio/studio.css";
import "./studio/pages.css";

export const metadata: Metadata = {
	description:
		"early-stage engineer for ideas that need to ship. an experiment: a one-engineer studio, a dithered fluid, and everything i've built.",
	robots: { follow: false, index: false },
	title: {
		default: "ekaksh janweja · studio",
		template: "%s · ekaksh janweja · studio",
	},
};

export const viewport: Viewport = {
	themeColor: "#f5f6f2",
};

/* the header, footer, smooth scroll and curtain live here, so moving
   between studio pages only swaps what's inside main */

export default function StudioLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={fontVariables} lang="en">
			<body>
				<SoundEffects theme="studio">
					<a className="skip-link" href="#main-content">
						skip to content
					</a>
					<SmoothScroll />
					<PageTransition>
						<SiteHead />
						<main id="main-content" tabIndex={-1}>
							{children}
						</main>
						<SiteFoot />
					</PageTransition>
				</SoundEffects>
			</body>
		</html>
	);
}
