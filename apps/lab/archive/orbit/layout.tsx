import type { Metadata, Viewport } from "next";
import { SoundEffects } from "@/components/sfx";
import { CASES } from "@/lib/cases";
import { fontVariables } from "@/lib/fonts";
import { Veil } from "./orbit/_components/veil";
import { caseHref, ROUTES, WORLD_ORDER, WORLDS } from "./orbit/_lib/content";
import "./orbit/orbit.css";
import "./orbit/pages.css";

export const metadata: Metadata = {
	description:
		"early-stage engineer building products from idea to production. an experiment: a ring of everything i've shipped.",
	robots: { follow: false, index: false },
	title: "ekaksh janweja · orbit",
};

export const viewport: Viewport = {
	themeColor: "#f5f6f2",
};

/** what the veil says while it carries you to each page */
const VEIL_LABELS: Record<string, string> = {
	[ROUTES.home]: "the ring",
	[ROUTES.about]: "about",
	[ROUTES.contact]: "contact",
	...Object.fromEntries(
		WORLD_ORDER.map((id) => [WORLDS[id].href, WORLDS[id].label])
	),
	...Object.fromEntries(CASES.map((item) => [caseHref(item), item.title])),
};

export default function OrbitLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={fontVariables} lang="en">
			<body>
				<SoundEffects theme="orbit">
					{children}
					<Veil labels={VEIL_LABELS} />
				</SoundEffects>
			</body>
		</html>
	);
}
