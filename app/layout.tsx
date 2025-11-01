import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

{
  /*
  const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
  });

  const monaspace = localFont({
    src: "./fonts/MonaspaceNeonVarVF.woff",
    variable: "--font-monaspace",
    weight: "100 300 400 500 600 700 900",
  });
*/
}

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: true,
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
    <html lang="en" suppressHydrationWarning>
      <body className={geistMono.className} suppressHydrationWarning>
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
          <div className="bg-background min-h-screen">
            <div className="flex justify-center w-full">
              <div className="md:max-w-3xl w-full px-4 md:px-0 flex flex-col min-h-screen">
                <Navbar />
                <main id="main-content" className="flex-1 pb-8" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
