import type { Metadata } from "next";
import "./globals.css";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <CTASection />
        <Footer />
      </body>
    </html>
  );
}
