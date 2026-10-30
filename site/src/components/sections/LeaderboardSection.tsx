"use client";

import Link from "next/link";
import {
  BENCHMARK_ROWS,
  getLatestRunLabel,
} from "@/lib/benchmark-data";
import { BenchmarkTable } from "@/components/sections/BenchmarkTable";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";
import { DATA_SHELL, H2 } from "@/lib/design";

export function LeaderboardSection() {
  const { language } = useLanguage();
  const t = I18N[language].leaderboard;
  const latestRun = getLatestRunLabel(language);

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
                · {t.experimentsSoFar(BENCHMARK_ROWS.length)}
              </span>
            </div>
          </div>
        </div>

        <BenchmarkTable rows={BENCHMARK_ROWS} />
      </div>
    </section>
  );
}
