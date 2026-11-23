import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  themeColor: "#141414",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "MaiaCoelho — Design & Motion Studio",
  description:
    "Web, social and motion design for brands that live online. Made to stop the scroll.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
