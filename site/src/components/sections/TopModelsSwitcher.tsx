"use client";

import { useMemo, useState } from "react";
import { getChampionPicks, JUDGE_NAME, JUDGE_N } from "@/lib/benchmark-data";
import { StackedFolderCard } from "@/components/sections/StackedFolderCard";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

export function TopModelsSwitcher() {
  const { language } = useLanguage();
  const t = I18N[language];
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
      {/* Straight-to-the-point Judge Badge */}
      <div className="flex items-center justify-center lg:justify-start px-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--background-primary)] px-3.5 py-1.5 shadow-2xs transition-colors">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] font-semibold">
            {t.hero.llmJudgeBadge}
          </span>
          <span className="h-3.5 w-px bg-[var(--border-default)]" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--text-primary)]">
            <BrandIcon name="kimi" size={18} />
            {JUDGE_NAME}
          </span>
          {JUDGE_N && (
            <span className="text-xs font-mono text-[var(--text-muted)] font-medium">
              · {JUDGE_N} {t.hero.qaPairs}
            </span>
          )}
        </div>
      </div>

      {/* Stacked Cards Deck */}
      <div className="relative w-full h-[468px] sm:h-[452px]">
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