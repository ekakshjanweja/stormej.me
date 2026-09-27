import type { Metadata } from "next";
import "./globals.css";
import "./design.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { DesignProvider } from "@/components/design/preview-bridge";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { designAttributes, designCss } from "@/lib/design/css";
import { getPublishedDesign } from "@/lib/design/server";
import { PostHogProvider } from "@/lib/providers/posthog-provider";
import { RealtimeProvider } from "@/lib/providers/realtime-provider";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { buildWebSiteSchema, jsonLd, SITE_TAGLINE } from "@/lib/schema";
import { fontVariables } from "./fonts";

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
		"backend developer",
		"typescript developer",
		"riverpod",
		"firebase developer",
		"resumable upload",
		"react native developer",
		"arkit developer",
		"mobile ar developer",
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

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const design = await getPublishedDesign();

	return (
		<html
			className={fontVariables}
			lang="en"
			suppressHydrationWarning
			{...designAttributes(design)}
		>
			<body
				className="antialiased"
				style={{
					fontFamily: "var(--font-sans)",
				}}
				suppressHydrationWarning
			>
				<style
					// biome-ignore lint/security/noDangerouslySetInnerHtml: generated from validated ids and #rrggbb colours only (lib/design/css.ts)
					dangerouslySetInnerHTML={{ __html: designCss(design) }}
					id="site-design"
				/>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: json-ld is serialised by jsonLd(); next has no other way to emit structured data
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
								<DesignProvider copy={design.copy}>
									<div className="design-page min-h-screen bg-background">
										<div className="flex w-full justify-center">
											<div className="design-shell flex min-h-screen w-full flex-col md:max-w-3xl">
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
								</DesignProvider>
							</RealtimeProvider>
						</RootProvider>
					</ThemeProvider>
				</PostHogProvider>
			</body>
		</html>
	);
}
