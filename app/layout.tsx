import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/lib/providers/theme-provider";

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
  metadataBase: new URL("https://www.stormej.me/"),
  title: "stormej",
  description: "mobile dev + life enjoyer &#9996;",
  openGraph: {
    title: "Ekaksh Janweja",
    description: "mobile dev + life enjoyer &#9996;",
  },
  creator: "stormej",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geistMono.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="stormej.theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
