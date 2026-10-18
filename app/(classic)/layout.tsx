import { Footer } from "@/components/footer";
import { RouteCTASection } from "@/components/route-cta-section";

// The original pages (about, work, contact, project write-ups) keep their cream layout until they're restyled.
export default function ClassicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#F5F1EC] text-[#292B30]">
      <div className="flex-1">{children}</div>
      <RouteCTASection />
      <Footer />
    </div>
  );
}
