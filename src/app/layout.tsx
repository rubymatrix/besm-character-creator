import type { Metadata } from "next";
import { Crimson_Text, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

const crimsonText = Crimson_Text({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "BESM Character Creator",
  description: "Build BESM 4e characters from campaign archetype packets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${crimsonText.variable} dark`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
