"use client";

import { usePathname } from "next/navigation";
import { CTASection } from "@/components/cta-section";

export function RouteCTASection() {
  const pathname = usePathname();

  if (pathname === "/contact") {
    return null;
  }

  return <CTASection />;
}
