import type { Metadata } from "next";
import { Crimson_Text, Source_Sans_3, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
      className={cn(crimsonText.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
