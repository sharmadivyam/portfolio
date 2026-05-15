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
      <div className="grid auto-rows-[180px] grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setSelectedId(card.id)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-[#E8DDD7] bg-[#FFF9F6] text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#B85A2E]",
              card.className,
            )}
          >
            <Image
              src={card.thumbnail}
              alt={typeof card.content === "string" ? card.content : "Grid card"}
              fill
              className="object-cover transition duration-200 ease-out"
              sizes="(max-width: 767px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-[#24272C] opacity-45 transition duration-200 ease-out group-hover:opacity-25" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-base font-medium text-[#FFF9F6] sm:text-lg">
                {card.content}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selectedCard ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-[#F7F2EF] p-2 sm:p-4">
          <button
            type="button"
            aria-label="Close expanded card"
            onClick={() => setSelectedId(null)}
            className="absolute top-5 right-5 z-30 rounded-full border border-[#E8DDD7] bg-[#FFF9F6] px-3 py-1 text-xs text-[#5F5A56] transition duration-200 ease-out hover:border-[#B85A2E] hover:text-[#B85A2E]"
          >
            Close
          </button>

          <div className="relative h-full min-h-[28rem] w-full overflow-hidden rounded-3xl border border-[#E8DDD7] bg-[#FFF9F6]">
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
            <div className="absolute inset-0 bg-[#24272C] opacity-65" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-2xl font-medium text-[#FFF9F6] sm:text-4xl">
                {selectedCard.content}
              </p>

              {selectedCard.href ? (
                selectedCard.external ? (
                  <Link
                    href={selectedCard.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#FFF9F6] bg-transparent px-4 py-2 text-sm text-[#FFF9F6] transition duration-200 ease-out hover:bg-[#FFF9F6] hover:text-[#292B30]"
                  >
                    Open
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href={selectedCard.href}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#FFF9F6] bg-transparent px-4 py-2 text-sm text-[#FFF9F6] transition duration-200 ease-out hover:bg-[#FFF9F6] hover:text-[#292B30]"
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
