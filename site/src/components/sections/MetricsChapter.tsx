"use client";

import { NumberedChapter } from "@/components/ui/NumberedChapter";
import { getMetrics } from "@/lib/metrics-data";
import { FAMILY_COLORS } from "@/lib/metrics-styles";
import type { MetricChapter as Chapter, MetricId } from "@/types/metrics";
import { MetricCard } from "./MetricCard";
import { useLanguage } from "@/hooks/use-language";

interface MetricsChapterProps {
  chapter: Chapter;
  /** One data-driven sentence about the current leaderboard, if available. */
  insight?: string;
  examples?: Partial<Record<MetricId, string>>;
}

/** One of the three questions, with its metric entries underneath. */
export function MetricsChapter({
  chapter,
  insight,
  examples,
}: MetricsChapterProps) {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const metrics = getMetrics(language);
  const color = FAMILY_COLORS[chapter.family];

  return (
    <NumberedChapter
      id={chapter.id}
      kicker={isTh ? `บทที่ ${chapter.number}` : `Chapter ${chapter.number}`}
      title={chapter.title}
      intro={chapter.intro}
      icon={chapter.icon}
      accent={{ fg: color.fg, bg: color.bg }}
      density="relaxed"
    >
      {insight && (
        <p
          className="max-w-[62ch] border-l-2 pl-4 font-sans text-base leading-7 text-[var(--text-secondary)]"
          style={{ borderColor: color.fg }}
        >
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {isTh ? "จากตารางคะแนนปัจจุบัน. " : "On the current board. "}
          </span>
          {insight}
        </p>
      )}

      <div className="divide-y divide-[var(--border-default)] overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-2xs transition-colors">
        {chapter.metrics.map((id) => (
          <MetricCard key={id} metric={metrics[id]} example={examples?.[id]} />
        ))}
      </div>

      <p className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">
          {isTh ? "ใจความสำคัญ. " : "The point. "}
        </span>
        {chapter.payoff}
      </p>
    </NumberedChapter>
  );
}
