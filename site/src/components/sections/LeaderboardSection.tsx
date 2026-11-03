"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BENCHMARK_ROWS,
  getLatestRunLabel,
} from "@/lib/benchmark-data";
import { NITI_ROWS } from "@/lib/nitibench-data";
import { BenchmarkTable } from "@/components/sections/BenchmarkTable";
import { NitiBenchTable } from "@/components/sections/NitiBenchTable";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";
import { DATA_SHELL, H2 } from "@/lib/design";
import type { LeaderboardMode } from "@/types/benchmark";

const MODES: { key: LeaderboardMode }[] = [
  { key: "wikipedia" },
  { key: "nitibench" },
];

export function LeaderboardSection() {
  const { language } = useLanguage();
  const t = I18N[language].leaderboard;
  const latestRun = getLatestRunLabel(language);
  const [mode, setMode] = useState<LeaderboardMode>("wikipedia");
  const isNiti = mode === "nitibench";

  const modeLabel = (key: LeaderboardMode) =>
    key === "nitibench" ? t.modeNitibench : t.modeWikipedia;

  return (
    <section className="w-full py-12 sm:py-16">
      {/* Wider than the content pages so all ten columns fit on one line;
          the table shares the site's gutter with every other page. */}
      <div className={`${DATA_SHELL} flex flex-col gap-6`}>
        {/* Header Bar */}
        <div className="flex w-full flex-col gap-4 border-b border-[var(--border-default)] pb-4 transition-colors lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h2 className={`${H2} text-[var(--text-primary)] transition-colors`}>
              {t.title}
            </h2>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Link
                href="/metrics"
                className="inline-flex min-h-[44px] items-center rounded-lg border border-[var(--border-default)] px-4 font-sans text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-text)]"
              >
                {t.readMetrics}
              </Link>
              <Link
                href="/methodology"
                className="inline-flex min-h-[44px] items-center rounded-lg border border-[var(--border-default)] px-4 font-sans text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-text)]"
              >
                {t.readMethodology}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-sans text-[var(--text-muted)] lg:items-end">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--status-live)]" />
              <span>
                {latestRun ? t.latestRun(latestRun) : t.noRuns}{" "}
                · {isNiti
                  ? t.nitiExperimentsSoFar(NITI_ROWS.length)
                  : t.experimentsSoFar(BENCHMARK_ROWS.length)}
              </span>
            </div>
          </div>
        </div>

        {/* Board switch: Wikipedia QA vs NitiBench+ legal */}
        <div className="flex flex-col gap-2">
          <div
            role="group"
            aria-label={t.title}
            className="flex w-full rounded-xl border border-[var(--border-default)] p-1 sm:w-fit"
          >
            {MODES.map(({ key }) => {
              const active = mode === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMode(key)}
                  className={`min-h-[44px] flex-1 rounded-lg px-4 font-sans text-xs font-semibold transition-colors cursor-pointer sm:min-w-[140px] sm:flex-none ${
                    active
                      ? "bg-[var(--text-primary)] text-[var(--background-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--brand-text)]"
                  }`}
                >
                  {modeLabel(key)}
                </button>
              );
            })}
          </div>
          <p className="max-w-3xl text-xs font-sans leading-relaxed text-[var(--text-muted)]">
            {isNiti ? t.nitiDesc : t.wikiDesc}
          </p>
        </div>

        {isNiti ? (
          <NitiBenchTable rows={NITI_ROWS} />
        ) : (
          <BenchmarkTable rows={BENCHMARK_ROWS} />
        )}
      </div>
    </section>
  );
}
