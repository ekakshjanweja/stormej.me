import type { Metadata } from "next";
import { LAB_INDEX, withBase } from "@/lib/base";
import { fontVariables } from "@/lib/fonts";
import "./(home)/home.css";

export const metadata: Metadata = {
	robots: { follow: false, index: false },
	title: "not found · lab",
};

export default function GlobalNotFound() {
	return (
		<html className={fontVariables} lang="en">
			<body>
				<main className="lab">
					<section aria-labelledby="lost" className="lab-intro">
						<h1 id="lost">
							not <em>here</em>
						</h1>
						<p>
							that experiment doesn't exist, or got deleted.{" "}
							<a href={withBase(LAB_INDEX)}>back to the lab</a>.
						</p>
					</section>
				</main>
			</body>
		</html>
	);
}
