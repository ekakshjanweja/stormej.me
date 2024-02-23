import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// const inter = Inter({ subsets: ["latin"] });

const geistSans = GeistSans;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.stormej.me/"),
  title: "stormej",
  description: "Personal website & blog of Ekaksh Janweja aka stormej.",
  openGraph: {
    images: "../assets/preview.png",
  },
  twitter: {
    images: "../assets/preview.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          storageKey="stormej.live-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
