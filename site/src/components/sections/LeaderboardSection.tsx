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
        <div className="flex w-full flex-col gap-4 border-b border-[var(--border-default)] pb-4 transition-colors lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-[var(--text-primary)] transition-colors">
              The measured sheet
            </h2>
            <p className="mt-1.5 max-w-[62ch] text-sm font-sans text-[var(--text-muted)] transition-colors">
              {datasetName} dev split · {sampleCount.toLocaleString()} QA pairs
              per pipeline · answers scored by judge {JUDGE_NAME}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-sans text-[var(--text-muted)] lg:items-end">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--status-live)] animate-pulse motion-reduce:animate-none" />
              <span>
                {LATEST_RUN_LABEL ? `Latest run ${LATEST_RUN_LABEL}` : "No runs yet"}{" "}
                · {BENCHMARK_ROWS.length} experiments so far
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Overall score leads — sort any metric column.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <p className="font-mono text-xs text-[var(--text-muted)]">
                Overall = 45% judge + 20% Match TH + 20% F1 + 15% EM
              </p>
              <Link
                href="/metrics#overall-score"
                className="inline-flex min-h-[44px] items-center text-[var(--brand-text)] underline-offset-2 hover:underline"
              >
                How it&apos;s built
              </Link>
            </div>
          </div>
        </div>

        <BenchmarkTable rows={BENCHMARK_ROWS} />
      </div>
    </section>
  );
}
