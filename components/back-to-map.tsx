"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/** The map's last place (a world or a card), kept for "Back to the map" on the other pages. */
export const PLACE_KEY = "latent-space:place";

// The page shown before this one, within this tab's visit (reset by a full page load).
let current: string | null = null, previous: string | null = null;

/** True on the first page of a visit (a fresh load or a reload), false once the visitor has moved between pages. */
export const onFirstPage = () => current === null;

/** Rendered once in the root layout: notes each page change, so "Back to the map" knows where the visitor came from. */
export function NavTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === current) return;
    previous = current;
    current = pathname;
  }, [pathname]);
  return null;
}

/**
 * "Back to the map" from a page outside it. Opened straight from the map, it simply steps back, to the exact place
 * the visitor left. Otherwise it opens that place in this page's slot in the history, so Back afterwards doesn't
 * land on this page again.
 */
export function BackToMap({ className, children }: { className: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <Link
      href="/"
      replace
      className={className}
      onClick={(e) => {
        if (previous === "/") {
          e.preventDefault();
          router.back();
          return;
        }
        let place: string | null = null;
        try { place = sessionStorage.getItem(PLACE_KEY); } catch { /* storage blocked: go to the overview */ }
        if (place) {
          e.preventDefault();
          router.replace(`/${place}`);
        }
      }}
    >
      {children}
    </Link>
  );
}
