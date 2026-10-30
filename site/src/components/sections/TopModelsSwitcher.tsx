"use client";

import { useMemo, useState } from "react";
import { getChampionPicks } from "@/lib/benchmark-data";
import { StackedFolderCard } from "@/components/sections/StackedFolderCard";
import { useLanguage } from "@/hooks/use-language";

export function TopModelsSwitcher() {
  const { language } = useLanguage();
  const picks = useMemo(() => getChampionPicks(language), [language]);

  // order stores pick indices from back (level 0) to front (level 2 = active).
  // Cards never advance on their own: a deck that swaps while the visitor is
  // mid-read (or a screen reader is mid-announcement) trades attention for
  // motion. Selection is a click only.
  const [order, setOrder] = useState<number[]>(() =>
    picks.length >= 3 ? [1, 2, 0] : [0, 1]
  );

  const promote = (targetIndex: number) => {
    setOrder((prev) => {
      if (prev[prev.length - 1] === targetIndex) return prev;
      return [...prev.filter((i) => i !== targetIndex), targetIndex];
    });
  };

  if (picks.length === 0) return null;

  return (
    <section
      aria-label={language === "TH" ? "โมเดลยอดเยี่ยมในแต่ละหมวดหมู่" : "Top models by category"}
      className="w-full flex flex-col gap-3"
    >
      {/* Stacked Cards Deck */}
      <div className="relative w-full h-[520px] sm:h-[508px]">
        {picks.map((pick, index) => {
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