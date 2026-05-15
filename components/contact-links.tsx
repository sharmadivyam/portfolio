import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { LayoutGridCard } from "@/components/ui/layout-grid";

type ContactLinksProps = {
  cards: LayoutGridCard[];
  description?: string;
};

export function ContactLinks({ cards, description }: ContactLinksProps) {
  return (
    <div className="mx-auto w-full max-w-7xl rounded-[2rem] border border-[#E8DDD7] bg-[#FFF9F6] px-6 py-8 shadow-[0_30px_60px_rgba(36,39,44,0.08)] sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#B85A2E]">
            Connect
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#292B30] sm:text-4xl">
            Let’s connect through the channels that suit you best.
          </h2>
          {description ? (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5F5A56]">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const contentText =
            typeof card.content === "string" ? card.content : "Contact";
          const inner = (
            <div className="flex items-center gap-4 rounded-3xl border border-[#E8DDD7] bg-white px-5 py-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#B85A2E] hover:bg-[#F7F2EF]">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F7F2EF] border border-[#E8DDD7] p-3">
                <Image
                  src={card.thumbnail}
                  alt={contentText}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-[#292B30]">
                  {contentText}
                </p>
                {card.external ? (
                  <p className="mt-1 text-sm text-[#5F5A56]">
                    Opens in a new tab
                  </p>
                ) : null}
              </div>

              {card.external ? (
                <ExternalLink className="h-4 w-4 text-[#B85A2E]" />
              ) : null}
            </div>
          );

          if (card.href) {
            return card.external ? (
              <Link
                key={card.id}
                href={card.href}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                {inner}
              </Link>
            ) : (
              <Link key={card.id} href={card.href} className="block">
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={card.id}
              className="cursor-not-allowed opacity-70"
              aria-disabled="true"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
