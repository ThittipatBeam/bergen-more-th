import {
  BENCHMARK_ROWS,
  JUDGE_LABEL,
  LATEST_RUN_LABEL,
} from "@/lib/benchmark-data";
import { BenchmarkTable } from "@/components/sections/BenchmarkTable";

export function LeaderboardSection() {
  return (
    <section className="w-full px-4 sm:px-8 md:px-12 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--border-default)] transition-colors">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#01A9B1] dark:text-[#00A0BE] font-semibold">
              SIAM.AI BENCHMARK • THAI RAG PIPELINES
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)] mt-1 transition-colors">
              Benchmark Results
            </h2>
            {JUDGE_LABEL && (
              <p className="mt-1.5 text-xs font-mono text-[var(--text-muted)] transition-colors">
                Judge score by {JUDGE_LABEL}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {LATEST_RUN_LABEL ? `Latest run ${LATEST_RUN_LABEL}` : "No runs yet"}{" "}
              • {BENCHMARK_ROWS.length} experiments
            </span>
          </div>
        </div>

        <BenchmarkTable rows={BENCHMARK_ROWS} />
      </div>
    </section>
  );
}
