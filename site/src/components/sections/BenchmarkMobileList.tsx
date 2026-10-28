"use client";

import Link from "next/link";
import type { BenchmarkRow } from "@/types/benchmark";
import {
  QUALITY_MAX,
  QUALITY_MIN,
  formatClock,
} from "@/lib/benchmark-data";
import { RANK_MEDAL_CLASSES } from "@/lib/rank-styles";
import { SCORE_BAND_CLASSES, scoreBand } from "@/lib/score-scale";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

interface BenchmarkMobileListProps {
  rows: BenchmarkRow[];
}

function MobileMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="font-mono text-base font-bold leading-none text-[var(--text-primary)] tracking-tight">
        {value.toFixed(1)}
      </dd>
    </div>
  );
}

/** Phone view of the leaderboard: one row per pipeline, every headline metric
 *  visible without sideways scrolling. The table takes over at md. */
export function BenchmarkMobileList({ rows }: BenchmarkMobileListProps) {
  const { language } = useLanguage();
  const t = I18N[language].leaderboard;
  const isTh = language === "TH";

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <p className="text-xs leading-5 text-[var(--text-muted)]">
        {t.mobileLead}
      </p>

      <ol className="divide-y divide-[var(--border-default)] overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-xs">
        {rows.map((row) => {
          const padRank = `${String(row.rank).padStart(2, "0")}${
            row.tieCount > 1 ? "=" : ""
          }`;
          const rankColor =
            RANK_MEDAL_CLASSES[row.rank] ?? "text-[var(--text-muted)]";
          const scoreTint =
            SCORE_BAND_CLASSES[scoreBand(row.q, QUALITY_MIN, QUALITY_MAX)];

          return (
            <li key={row.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start gap-3">
                <span
                  className={`w-6 shrink-0 pt-1 text-center font-mono text-sm font-extrabold ${rankColor}`}
                >
                  {padRank}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--border-default)] bg-[var(--background-primary)] shadow-2xs">
                      <BrandIcon name={row.generator} size={16} />
                    </span>
                    <span className="truncate font-sans text-sm font-bold text-[var(--text-primary)]">
                      {row.generator}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] leading-4 text-[var(--text-secondary)]">
                    {row.retriever.replace(/^BAAI\//i, "")}
                    {" · "}
                    {row.reranker
                      ? row.reranker.replace(/^BAAI\//i, "")
                      : "Dense"}
                  </p>
                </div>

                <div
                  className={`flex shrink-0 flex-col items-end rounded-lg px-2.5 py-1.5 ${scoreTint}`}
                >
                  <span className="font-mono text-xl font-bold leading-none tracking-tight text-[var(--text-primary)]">
                    {row.q.toFixed(1)}
                  </span>
                  <span className="mt-1 font-mono text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
                    {t.overall}
                  </span>
                </div>
              </div>

              <dl className="grid grid-cols-4 gap-2 border-t border-[var(--border-default)]/60 pt-3">
                <MobileMetric label={t.colJudge} value={row.judgePct} />
                <MobileMetric label={t.colMatchTh} value={row.mTh} />
                <MobileMetric label={t.colF1Th} value={row.f1Th} />
                <MobileMetric label={t.colEm} value={row.em} />
              </dl>

              <p className="font-mono text-[11px] text-[var(--text-muted)]">
                {t.genPrefix} {formatClock(row.genSeconds)}
              </p>
            </li>
          );
        })}
      </ol>

      <Link
        href="/request"
        className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] px-4 font-mono text-xs font-semibold tracking-wide text-[var(--brand-text)] transition-colors hover:border-[var(--brand-sky-light)] hover:text-[var(--brand-cta-hover)]"
      >
        {isTh
          ? "ต้องการทดสอบโมเดลอื่น? ส่งคำขอทดสอบที่นี่ →"
          : "Missing a combination? Request a run →"}
      </Link>
    </div>
  );
}
