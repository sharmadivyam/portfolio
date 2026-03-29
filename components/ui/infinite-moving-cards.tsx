"use client";

import { useState } from "react";

type InfiniteMovingCardsProps = {
  images: Array<{
    src: string;
    alt?: string;
  }>;
  direction?: "left" | "right";
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  cardClassName?: string;
};

export function InfiniteMovingCards({
  images,
  direction = "left",
  speed = 18,
  pauseOnHover = true,
  className = "",
  cardClassName = "",
}: InfiniteMovingCardsProps) {
  const [isPaused, setIsPaused] = useState(false);
  const animationName = direction === "right" ? "marquee-right" : "marquee-left";
  const track = (
    <>
      {images.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className={`relative h-[280px] w-[220px] flex-none overflow-hidden rounded-lg ${cardClassName}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt ?? `Gallery image ${index + 1}`}
            className="h-full w-full rounded-lg object-cover transition duration-300 hover:scale-105"
          />
        </div>
      ))}
    </>
  );

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      onMouseEnter={() => {
        if (pauseOnHover) {
          setIsPaused(true);
        }
      }}
      onMouseLeave={() => {
        if (pauseOnHover) {
          setIsPaused(false);
        }
      }}
    >
      <div
        className="flex min-w-max gap-4"
        style={{
          animation: `${animationName} ${speed}s linear infinite`,
          animationPlayState: isPaused ? "paused" : "running",
          willChange: "transform",
        }}
      >
        <div className="flex shrink-0 gap-4">{track}</div>
        <div className="flex shrink-0 gap-4" aria-hidden="true">
          {track}
        </div>
      </div>
    </div>
  );
}
