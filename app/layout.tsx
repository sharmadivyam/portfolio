import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";
import { RouteCTASection } from "@/components/route-cta-section";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
  variable: "--font-playfair-display",
});

export const metadata: Metadata = {
  title: "Divyam Sharma",
  description: "Portfolio of Divyam Sharma — AI systems, product engineering, and creative work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <RouteCTASection />
        <Footer />
      </body>
    </html>
  );
}
