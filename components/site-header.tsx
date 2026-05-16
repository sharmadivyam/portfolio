"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type SiteHeaderProps = {
  activePage?: "home" | "about" | "work" | "contact";
};

const navItems: Array<{
  label: string;
  href: string;
  page: NonNullable<SiteHeaderProps["activePage"]>;
}> = [
  { label: "Home", href: "/", page: "home" },
  { label: "About", href: "/about", page: "about" },
  { label: "Work", href: "/work", page: "work" },
  { label: "Contact", href: "/contact", page: "contact" },
];

export function SiteHeader({ activePage = "home" }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const linkClassName = (isActive: boolean) =>
    `text-[15px] font-medium text-[#292B30] underline-offset-4 transition duration-200 ease-out hover:text-[#B85A2E] active:text-[#B85A2E] sm:text-base ${
      isActive ? "text-[#B85A2E] underline" : ""
    }`;

  return (
    <header
      className="fixed top-0 left-0 z-50 w-full border-b border-[#E8DDD7] bg-[#F5F1EC]/95 backdrop-blur-sm transition duration-200 ease-out"
    >
      <div
        className={`mx-auto flex min-h-16 w-[calc(100%-2rem)] max-w-6xl flex-row items-center justify-between gap-4 text-sm text-[#292B30] transition duration-200 ease-out sm:w-[calc(100%-3rem)] md:min-h-[72px] md:gap-6 ${
          isScrolled ? "py-3" : "py-4"
        }`}
      >
        <span className="text-[11px] tracking-[0.32em] uppercase text-[#292B30] sm:text-xs sm:tracking-[0.28em]">
          Divyam Sharma
        </span>

        <nav className="hidden flex-wrap items-center gap-x-6 gap-y-2 md:flex md:gap-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={linkClassName(activePage === item.page)}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#292B30] transition duration-200 ease-out hover:bg-[#E8DDD7]/60 active:scale-95 active:bg-[#E8DDD7]/60 md:hidden"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <nav
        aria-label="Mobile navigation"
        className={`border-t border-[#E8DDD7] bg-[#F5F1EC]/98 px-6 py-3 shadow-[0_16px_30px_rgba(36,39,44,0.08)] backdrop-blur-sm transition duration-200 ease-out md:hidden ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="mx-auto flex w-[calc(100%-2rem)] max-w-6xl flex-col sm:w-[calc(100%-3rem)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`group flex items-center justify-between border-b border-[#E8DDD7]/70 py-3 text-sm font-medium transition duration-200 ease-out last:border-b-0 hover:text-[#B85A2E] active:text-[#B85A2E] ${
                activePage === item.page ? "text-[#B85A2E]" : "text-[#292B30]"
              }`}
            >
              <span>{item.label}</span>
              <ArrowRight className="h-4 w-4 text-current transition duration-200 ease-out group-hover:translate-x-1 group-active:translate-x-1" />
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
