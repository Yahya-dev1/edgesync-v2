import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EdgeSync Markets — Trade Smarter. Earn Better.",
  description:
    "EdgeSync Markets is a regulated forex and copy trading broker based in Seychelles. Trade 500+ instruments with ultra-low spreads, fast execution, and up to 1:500 leverage.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased overflow-x-hidden`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col w-full overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
