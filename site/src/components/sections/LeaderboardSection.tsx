import Link from "next/link";
import {
  BENCHMARK_ROWS,
  JUDGE_NAME,
  LATEST_RUN_LABEL,
} from "@/lib/benchmark-data";
import { BenchmarkTable } from "@/components/sections/BenchmarkTable";

export function LeaderboardSection() {
  const datasetName = BENCHMARK_ROWS[0]?.dataset ?? "ThaiWikiV4";
  const sampleCount = BENCHMARK_ROWS[0]?.judgeN ?? 500;

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 py-12 sm:py-16">
      {/* Wider than the site's 6xl reading measure so all ten columns fit on
          one line; the heading shares the same edge as the sheet. */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {/* Header Bar */}
        <div className="flex w-full flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--border-default)] transition-colors">
          <div>
            <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-[var(--text-primary)] transition-colors">
              The measured sheet
            </h2>
            <p className="mt-1.5 text-sm font-sans text-[var(--text-muted)] transition-colors">
              {datasetName} dev split · {sampleCount.toLocaleString()} QA pairs
              per pipeline · answers scored by judge {JUDGE_NAME}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 text-xs font-sans text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--status-live)] animate-pulse motion-reduce:animate-none" />
              <span>
                {LATEST_RUN_LABEL ? `Latest run ${LATEST_RUN_LABEL}` : "No runs yet"}{" "}
                · {BENCHMARK_ROWS.length} experiments so far
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Overall score leads — click any column to sort.
            </p>
            <p className="text-xs font-mono text-[var(--text-muted)]">
              Overall = 45% judge + 20% Match TH + 20% F1 + 15% EM ·{" "}
              <Link
                href="/metrics#overall-score"
                className="inline-flex items-center min-h-[44px] text-[var(--brand-text)] hover:underline"
              >
                How it&apos;s built
              </Link>
            </p>
          </div>
        </div>

        <BenchmarkTable rows={BENCHMARK_ROWS} />
      </div>
    </section>
  );
}
