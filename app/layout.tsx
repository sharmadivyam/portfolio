import type { Metadata } from "next";
import { Afacad, Inter, Martian_Mono, Playfair_Display } from "next/font/google";
import { NavTracker } from "@/components/back-to-map";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-sans",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
  variable: "--font-playfair-display",
});

const afacad = Afacad({
  subsets: ["latin"],
  variable: "--font-afacad",
});

const martianMono = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian-mono",
});

export const metadata: Metadata = {
  title: "Divyam Sharma",
  description: "Divyam Sharma: AI engineer and product enthusiast. A map of my work, my studies and the things I do for fun.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // The home page tags <html> before hydration so shared links skip the landing.
      suppressHydrationWarning
      className={`${inter.variable} ${playfairDisplay.variable} ${afacad.variable} ${martianMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <NavTracker />
        {children}
      </body>
    </html>
  );
}
