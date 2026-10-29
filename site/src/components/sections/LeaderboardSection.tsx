"use client";

import Link from "next/link";
import {
  BENCHMARK_ROWS,
  JUDGE_NAME,
  QUERY_SPLIT,
  getLatestRunLabel,
} from "@/lib/benchmark-data";
import { BenchmarkTable } from "@/components/sections/BenchmarkTable";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

export function LeaderboardSection() {
  const { language } = useLanguage();
  const t = I18N[language].leaderboard;
  const datasetName = BENCHMARK_ROWS[0]?.dataset ?? "ThaiWikiV4";
  const sampleCount = BENCHMARK_ROWS[0]?.judgeN ?? 500;
  const latestRun = getLatestRunLabel(language);

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 py-12 sm:py-16">
      {/* Wider than the site's 6xl reading measure so all ten columns fit on
          one line; the heading shares the same edge as the sheet. */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {/* Header Bar */}
        <div className="flex w-full flex-col gap-4 border-b border-[var(--border-default)] pb-4 transition-colors lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-[var(--text-primary)] transition-colors">
              {t.title}
            </h2>
            <p className="mt-1.5 max-w-[62ch] text-sm font-sans text-[var(--text-muted)] transition-colors">
              {t.subtitle(datasetName, QUERY_SPLIT, sampleCount, JUDGE_NAME)}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-sans text-[var(--text-muted)] lg:items-end">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--status-live)]" />
              <span>
                {latestRun ? t.latestRun(latestRun) : t.noRuns}{" "}
                · {t.experimentsSoFar(BENCHMARK_ROWS.length)}
              </span>
            </div>
            {/* Desktop-only: the phone view has no sortable table to hint at. */}
            <p className="hidden text-xs text-[var(--text-muted)] md:block">
              {t.sortHint}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <p className="font-mono text-xs text-[var(--text-muted)]">
                {t.overallFormula}
              </p>
              <Link
                href="/metrics#overall-score"
                className="inline-flex min-h-[44px] items-center text-[var(--brand-text)] underline-offset-2 hover:underline"
              >
                {t.howBuilt}
              </Link>
            </div>
          </div>
        </div>

        <BenchmarkTable rows={BENCHMARK_ROWS} />
      </div>
    </section>
  );
}
