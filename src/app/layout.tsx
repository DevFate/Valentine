import type { Metadata } from "next";
import { Dancing_Script, Fraunces, Manrope } from "next/font/google";

import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const accent = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-accent",
});

export const metadata: Metadata = {
  title: "Will You Be My Valentine?",
  description:
    "A handcrafted Valentine website with memories, story sections, and a final proposal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${accent.variable}`}>
        {children}
      </body>
    </html>
  );
}
