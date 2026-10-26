import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import "./home.css";

export const metadata: Metadata = {
	description:
		"experiments in how ekaksh janweja's portfolio could feel. none of them are the site yet.",
	robots: { follow: false, index: false },
	title: "ekaksh janweja · lab",
};

export const viewport: Viewport = {
	themeColor: [
		{ color: "#f5f6f2", media: "(prefers-color-scheme: light)" },
		{ color: "#111311", media: "(prefers-color-scheme: dark)" },
	],
};

export default function HomeLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={fontVariables} lang="en">
			<body>{children}</body>
		</html>
	);
}
