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
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.stormej.me"),
  title: {
    default: "stormej",
    template: "%s | stormej",
  },
  description: "mobile dev + life enjoyer &#9996;",
  openGraph: {
    title: "ekaksh janweja",
    description: "mobile dev + life enjoyer &#9996;",
    url: "https://www.stormej.me",
    siteName: "ekaksh janweja",
    locale: "en_US",
    type: "website",
    images: "https://www.stormej.me/og/home",
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
          <div className="bg-background">
            <div className="flex justify-center w-full">
              <div className="md:max-w-3xl w-full px-4 md:px-0 flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
