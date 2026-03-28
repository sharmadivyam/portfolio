"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

export type LayoutGridCard = {
  id: number;
  content: React.ReactNode;
  className?: string;
  thumbnail: string;
  href?: string;
  external?: boolean;
};

type LayoutGridProps = {
  cards: LayoutGridCard[];
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function LayoutGrid({ cards }: LayoutGridProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedId) ?? null,
    [cards, selectedId],
  );

  return (
    <div className="relative w-full">
      <div className="grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setSelectedId(card.id)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/20",
              card.className,
            )}
          >
            <Image
              src={card.thumbnail}
              alt={typeof card.content === "string" ? card.content : "Grid card"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 767px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-base font-medium text-white sm:text-lg">
                {card.content}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selectedCard ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-black/60 p-2 backdrop-blur-sm sm:p-4">
          <button
            type="button"
            aria-label="Close expanded card"
            onClick={() => setSelectedId(null)}
            className="absolute top-5 right-5 z-30 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs text-white/80 transition-opacity hover:opacity-70"
          >
            Close
          </button>

          <div className="relative h-full min-h-[28rem] w-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <Image
              src={selectedCard.thumbnail}
              alt={
                typeof selectedCard.content === "string"
                  ? selectedCard.content
                  : "Expanded grid card"
              }
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/15" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-2xl font-medium text-white sm:text-4xl">
                {selectedCard.content}
              </p>

              {selectedCard.href ? (
                selectedCard.external ? (
                  <Link
                    href={selectedCard.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition-all duration-300 hover:bg-white/15"
                  >
                    Open
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href={selectedCard.href}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition-all duration-300 hover:bg-white/15"
                  >
                    Open
                  </Link>
                )
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
