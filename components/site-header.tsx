"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SiteHeaderProps = {
  activePage?: "home" | "about" | "work";
};

export function SiteHeader({ activePage = "home" }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

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
    `transition-opacity hover:opacity-70 ${isActive ? "text-white" : ""}`;

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ease-in-out ${
        isScrolled
          ? "border-b border-white/10 bg-black/60 shadow-[0_10px_28px_rgba(0,0,0,0.22)] backdrop-blur-lg"
          : "bg-black/20 backdrop-blur-md"
      }`}
    >
      <div
        className={`mx-auto flex w-full flex-col items-start gap-4 px-5 text-sm text-white/72 transition-all duration-300 ease-in-out sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-10 ${
          isScrolled ? "max-w-[72rem] py-3" : "max-w-5xl py-5"
        }`}
      >
        <span className="text-[11px] tracking-[0.32em] uppercase text-white/55">
          Portfolio
        </span>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-8">
          <Link className={linkClassName(activePage === "home")} href="/">
            Home
          </Link>
          <Link className={linkClassName(activePage === "about")} href="/about">
            About
          </Link>
          <Link className={linkClassName(activePage === "work")} href="/work">
            Work
          </Link>
          <Link className={linkClassName(false)} href="/#contact">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
