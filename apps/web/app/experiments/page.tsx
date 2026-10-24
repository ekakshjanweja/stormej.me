import type { Metadata } from "next";
import Home from "../(home)/page";
import { LoaderLab } from "./_components/loader-lab";

export const metadata: Metadata = {
	robots: { follow: false, index: false },
	title: "experiments",
};

/**
 * A playground for home page loaders: each one plays over the real home
 * page, so what lands at the end is exactly what a visitor would see.
 */
export default function ExperimentsPage() {
	return (
		<>
			<LoaderLab />
			<Home />
		</>
	);
}
