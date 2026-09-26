import type { Metadata } from "next";
import { PresetGrid } from "./preset-grid";

export const metadata: Metadata = {
	robots: { follow: false, index: false },
	title: "design lab",
};

export default function DesignLabPage() {
	return (
		<section className="relative left-1/2 w-[min(76rem,calc(100vw-2rem))] -translate-x-1/2">
			<h1 className="headline text-3xl">design lab</h1>
			<p className="mt-3 max-w-[60ch] text-[14px] text-muted-foreground">
				each preview is the live homepage with one preset applied. scroll inside
				a preview, pick one to try it across the site, then fine-tune any axis
				from the design button in the corner.
			</p>
			<PresetGrid />
		</section>
	);
}
