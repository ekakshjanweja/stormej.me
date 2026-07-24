import type { Metadata } from "next";
import {
	EB_Garamond,
	Geist,
	Geist_Mono,
	Handjet,
	Instrument_Serif,
	Space_Mono,
} from "next/font/google";
import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { PostHogProvider } from "@/lib/providers/posthog-provider";
import { RealtimeProvider } from "@/lib/providers/realtime-provider";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { buildWebSiteSchema, jsonLd, SITE_TAGLINE } from "@/lib/schema";

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

export const metadata: Metadata = {
	applicationName: "stormej.me",
	authors: [
		{
			name: "ekaksh janweja",
			url: "https://stormej.me",
		},
	],
	category: "technology",
	description: SITE_TAGLINE,
	keywords: [
		"ekaksh janweja",
		"stormej",
		"flutter developer",
		"flutter developer india",
		"dart developer",
		"mobile app developer",
		"mobile app developer india",
		"ios developer",
		"android developer",
		"arkit developer",
		"arcore developer",
		"mobile ar developer",
		"augmented reality developer",
		"riverpod",
		"firebase developer",
		"resumable upload",
		"react native developer",
		"freelance flutter developer",
		"hire flutter developer",
		"new delhi developer",
		"software engineer",
	],
	metadataBase: new URL("https://www.stormej.me"),
	openGraph: {
		description: SITE_TAGLINE,
		images: [
			{
				alt: `ekaksh janweja — ${SITE_TAGLINE}`,
				height: 630,
				url: "https://www.stormej.me/og/home",
				width: 1200,
			},
		],
		locale: "en_us",
		siteName: "ekaksh janweja",
		title: "ekaksh janweja",
		type: "website",
		url: "https://www.stormej.me",
	},
	robots: {
		follow: true,
		index: true,
		"max-image-preview": "large",
		"max-snippet": -1,
		"max-video-preview": -1,
	},
	title: {
		default: "ekaksh janweja - mobile engineer",
		template: "%s - ekaksh janweja",
	},
	twitter: {
		card: "summary_large_image",
		creator: "@ekaksh_janweja",
		description: SITE_TAGLINE,
		title: "ekaksh janweja",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} ${ebGaramond.variable} ${handjet.variable} ${instrumentSerif.variable}`}
			lang="en"
			suppressHydrationWarning
		>
			<body
				className="antialiased"
				style={{
					fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui",
				}}
				suppressHydrationWarning
			>
				<script
					dangerouslySetInnerHTML={{ __html: jsonLd(buildWebSiteSchema()) }}
					type="application/ld+json"
				/>
				<PostHogProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						disableTransitionOnChange
						enableSystem
						storageKey="stormej.theme"
					>
						{/* Skip to content link for accessibility */}
						<a
							className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
							href="#main-content"
						>
							Skip to main content
						</a>
						<RootProvider theme={{ enabled: false }}>
							<RealtimeProvider>
								<div className="min-h-screen bg-background">
									<div className="flex w-full justify-center">
										<div className="flex min-h-screen w-full flex-col md:max-w-3xl">
											<Navbar />
											<main
												className="flex-1 px-4 pb-8"
												id="main-content"
												tabIndex={-1}
											>
												{children}
											</main>
											<Footer />
										</div>
									</div>
								</div>
							</RealtimeProvider>
						</RootProvider>
					</ThemeProvider>
				</PostHogProvider>
			</body>
		</html>
	);
}
