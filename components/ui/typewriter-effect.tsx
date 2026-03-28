"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Word = {
  text: string;
  className?: string;
};

type TypewriterEffectProps = {
  words: Word[];
  className?: string;
  cursorClassName?: string;
  typingSpeed?: number;
  startDelay?: number;
  onComplete?: () => void;
  hideCursorOnComplete?: boolean;
};

function TypewriterBase({
  words,
  className,
  cursorClassName,
  typingSpeed = 70,
  startDelay = 0,
  onComplete,
  hideCursorOnComplete = false,
  smooth = false,
}: TypewriterEffectProps & { smooth?: boolean }) {
  const [visibleChars, setVisibleChars] = useState(0);
  const completedRef = useRef(false);

  const tokens = useMemo(
    () =>
      words.map((word, index) => ({
        ...word,
        value: index === words.length - 1 ? word.text : `${word.text} `,
      })),
    [words],
  );

  const totalChars = useMemo(
    () => tokens.reduce((sum, token) => sum + token.value.length, 0),
    [tokens],
  );

  useEffect(() => {
    const startTimer = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        setVisibleChars((current) => {
          if (current >= totalChars) {
            window.clearInterval(interval);

            if (!completedRef.current) {
              completedRef.current = true;
              onComplete?.();
            }

            return current;
          }

          return current + 1;
        });
      }, typingSpeed);
    }, startDelay);

    return () => {
      completedRef.current = false;
      window.clearTimeout(startTimer);
    };
  }, [onComplete, startDelay, totalChars, typingSpeed]);

  const visibleTokens = useMemo(() => {
    return tokens.reduce<
      Array<{ key: string; className?: string; visibleText: string }>
    >((acc, token, index) => {
      const consumedChars = tokens
        .slice(0, index)
        .reduce((sum, currentToken) => sum + currentToken.value.length, 0);
      const visibleLength = Math.max(
        0,
        Math.min(visibleChars - consumedChars, token.value.length),
      );

      acc.push({
        key: `${token.text}-${token.className ?? "default"}-${index}`,
        className: token.className,
        visibleText: token.value.slice(0, visibleLength),
      });

      return acc;
    }, []);
  }, [tokens, visibleChars]);

  const showCursor = visibleChars < totalChars || !hideCursorOnComplete;

  return (
    <div className={className}>
      <div className="inline-flex flex-wrap">
        {visibleTokens.map((token) =>
          token.visibleText ? (
            <span
              key={token.key}
              className={`${token.className ?? ""} whitespace-pre ${
                smooth ? "transition-opacity duration-200 ease-out" : ""
              }`}
            >
              {token.visibleText}
            </span>
          ) : null,
        )}
        {showCursor ? (
          <span
            aria-hidden="true"
            className={`ml-1 inline-block h-[1em] w-[2px] animate-pulse bg-white/80 align-middle ${
              cursorClassName ?? ""
            }`}
          />
        ) : null}
      </div>
    </div>
  );
}

export function TypewriterEffect(props: TypewriterEffectProps) {
  return <TypewriterBase {...props} />;
}

export function TypewriterEffectSmooth(props: TypewriterEffectProps) {
  return <TypewriterBase {...props} smooth />;
}
