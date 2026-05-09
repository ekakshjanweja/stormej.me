import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Space_Mono,
  EB_Garamond,
  Handjet,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { PostHogProvider } from "@/lib/providers/posthog-provider";
import { RealtimeProvider } from "@/lib/providers/realtime-provider";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { RootProvider } from "fumadocs-ui/provider/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["italic", "normal"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const handjet = Handjet({
  variable: "--font-handjet",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic", "normal"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.stormej.me"),
  title: {
    default: "stormej",
    template: "%s | stormej",
  },
  description: "mobile dev + life enjoyer &#9996;",
  keywords: [
    "software engineer",
    "mobile developer",
    "flutter",
    "ekaksh janweja",
    "stormej",
  ],
  openGraph: {
    title: "ekaksh janweja",
    description: "mobile dev + life enjoyer &#9996;",
    url: "https://www.stormej.me",
    siteName: "ekaksh janweja",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.stormej.me/og/home",
        width: 1200,
        height: 630,
        alt: "ekaksh janweja - mobile developer",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  twitter: {
    title: "ekaksh janweja",
    card: "summary_large_image",
    creator: "@ekaksh_janweja",
  },
  authors: [
    {
      name: "ekaksh janweja",
      url: "https://stormej.me",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} ${ebGaramond.variable} ${handjet.variable} ${instrumentSerif.variable}`}
    >
      <body
        className="antialiased"
        style={{
          fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui",
        }}
        suppressHydrationWarning
      >
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="stormej.theme"
          >
            {/* Skip to content link for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Skip to main content
            </a>
            <RootProvider theme={{ enabled: false }}>
              <RealtimeProvider>
                <div className="bg-background min-h-screen">
                  <div className="flex justify-center w-full">
                    <div className="md:max-w-3xl w-full flex flex-col min-h-screen">
                      <Navbar />
                      <main
                        id="main-content"
                        className="flex-1 pb-8 px-4"
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
