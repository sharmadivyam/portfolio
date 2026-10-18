import type { Metadata } from "next";
import { Afacad, Inter, Martian_Mono, Playfair_Display } from "next/font/google";
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
  description:
    "AI engineer. I build LLM systems that are grounded, measured and safe to ship, from agent pipelines and gateways to models on a Raspberry Pi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // The home page tags <html> before hydration so shared links skip the title screen.
      suppressHydrationWarning
      className={`${inter.variable} ${playfairDisplay.variable} ${afacad.variable} ${martianMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
