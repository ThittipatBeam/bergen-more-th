"use client";

import { useEffect, useRef, useState } from "react";
import { CHAMPION_PICKS, JUDGE_NAME, JUDGE_N } from "@/lib/benchmark-data";
import { StackedFolderCard } from "@/components/sections/StackedFolderCard";
import { BrandIcon } from "@/components/ui/BrandIcon";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(hover: none)").matches || window.innerWidth < 768);

const AUTO_SLIDE_MS = 10000;

export function TopModelsSwitcher() {
  // order stores pick indices from back (level 0) to front (level 2 = active)
  const [order, setOrder] = useState<number[]>(() =>
    CHAMPION_PICKS.length >= 3 ? [1, 2, 0] : [0, 1]
  );
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const promote = (targetIndex: number) => {
    setOrder((prev) => {
      if (prev[prev.length - 1] === targetIndex) return prev;
      return [...prev.filter((i) => i !== targetIndex), targetIndex];
    });
  };

  // Auto-advance timer: only runs on desktop hover devices, never on mobile touch
  useEffect(() => {
    if (
      isPaused ||
      isTouchDevice() ||
      prefersReducedMotion() ||
      CHAMPION_PICKS.length < 2
    ) {
      return;
    }

    timerRef.current = setInterval(() => {
      setOrder((prev) => {
        const currentActive = prev[prev.length - 1];
        const next = (currentActive + 1) % CHAMPION_PICKS.length;
        return [...prev.filter((i) => i !== next), next];
      });
    }, AUTO_SLIDE_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  if (CHAMPION_PICKS.length === 0) return null;

  return (
    <section
      aria-label="Top models by category"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      className="w-full flex flex-col gap-3"
    >
      {/* Straight-to-the-point Judge Badge */}
      <div className="flex items-center justify-center lg:justify-start px-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--background-primary)] px-3.5 py-1.5 shadow-2xs transition-colors">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] font-semibold">
            LLM Judge
          </span>
          <span className="h-3.5 w-px bg-[var(--border-default)]" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--text-primary)]">
            <BrandIcon name="kimi" size={18} />
            {JUDGE_NAME}
          </span>
          {JUDGE_N && (
            <span className="text-[10px] font-mono text-[var(--text-muted)] font-medium">
              · {JUDGE_N} QA pairs
            </span>
          )}
        </div>
      </div>

      {/* Stacked Cards Deck */}
      <div className="relative w-full h-[468px] sm:h-[452px]">
        {CHAMPION_PICKS.map((pick, index) => {
          const level = order.indexOf(index);
          const isActive = level === order.length - 1;

          return (
            <StackedFolderCard
              key={pick.id}
              pick={pick}
              level={level}
              isActive={isActive}
              onSelect={() => promote(index)}
            />
          );
        })}
      </div>
    </section>
  );
}