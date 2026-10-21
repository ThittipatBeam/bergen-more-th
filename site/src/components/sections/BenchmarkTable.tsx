"use client";

import { useState } from "react";
import type { BenchmarkRow } from "@/types/benchmark";
import { RANK_MEDAL_CLASSES } from "@/lib/rank-styles";
import { BrandIcon } from "@/components/ui/BrandIcon";
import {
  BenchmarkFilters,
  type RerankerFilter,
} from "@/components/sections/BenchmarkFilters";

const FILTERED_EMPTY =
  "No experiments match these filters.";

export function BenchmarkTable({ rows }: { rows: BenchmarkRow[] }) {
  const [generator, setGenerator] = useState("all");
  const [reranker, setReranker] = useState<RerankerFilter>("all");

  const generators = [...new Set(rows.map((row) => row.generator))];
  const filtered = rows.filter(
    (row) =>
      (generator === "all" || row.generator === generator) &&
      (reranker === "all" ||
        (reranker === "yes" ? row.reranker !== null : row.reranker === null))
  );

  return (
    <div className="flex flex-col gap-5">
      <BenchmarkFilters
        generators={generators}
        generator={generator}
        onGenerator={setGenerator}
        reranker={reranker}
        onReranker={setReranker}
      />

      <div className="w-full overflow-x-auto rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-xs transition-colors">
        <table className="w-full text-left border-collapse min-w-[880px]">
          <thead>
            <tr className="bg-[var(--background-subtle)] border-b border-[var(--border-default)] text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] transition-colors">
              <th className="py-3.5 px-4 w-12">#</th>
              <th className="py-3.5 px-4">Generator</th>
              <th className="py-3.5 px-4">Embedding</th>
              <th className="py-3.5 px-4">Reranker</th>
              <th className="py-3.5 px-3 text-right">M (TH)</th>
              <th className="py-3.5 px-3 text-right">EM</th>
              <th className="py-3.5 px-3 text-right">F1 (TH)</th>
              <th className="py-3.5 px-3 text-right">Recall (TH)</th>
              <th className="py-3.5 px-4 text-right">Judge score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]/60 text-sm transition-colors">
            {filtered.length === 0 && rows.length > 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="py-10 px-4 text-center text-sm font-mono text-[var(--text-muted)]"
                >
                  {FILTERED_EMPTY}
                </td>
              </tr>
            )}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="py-10 px-4 text-center text-sm font-mono text-[var(--text-muted)]"
                >
                  No benchmark experiments yet — results appear here after a run
                  is scanned into experiments_data.json.
                </td>
              </tr>
            )}
            {filtered.map((row, index) => (
              <tr
                key={row.id}
                className="hover:bg-[var(--surface-brand)]/60 transition-colors group"
              >
                <td
                  className={`py-4 px-4 font-mono font-bold ${
                    RANK_MEDAL_CLASSES[index + 1] ?? "text-[var(--text-muted)]"
                  }`}
                >
                  #{index + 1}
                </td>
                <td className="py-4 px-4 font-mono font-semibold text-[var(--text-primary)] transition-colors">
                  <div className="flex items-center gap-2">
                    <BrandIcon name={row.generator} size={18} />
                    {row.generator}
                  </div>
                  <div className="text-[10px] font-normal text-[var(--text-muted)] font-sans mt-0.5">
                    {row.dataset}
                  </div>
                </td>
                <td className="py-4 px-4 font-mono text-[var(--text-secondary)]">
                  <span className="inline-flex items-center gap-2">
                    <BrandIcon name={row.retriever} size={16} />
                    {row.retriever}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-[var(--text-secondary)]">
                  {row.reranker ? (
                    <span className="inline-flex items-center gap-2">
                      <BrandIcon name={row.reranker} size={16} />
                      {row.reranker}
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </td>
                <td className="py-4 px-3 text-right font-mono text-[var(--text-secondary)]">
                  {row.mTh.toFixed(3)}
                </td>
                <td className="py-4 px-3 text-right font-mono text-[var(--text-secondary)]">
                  {row.em.toFixed(3)}
                </td>
                <td className="py-4 px-3 text-right font-mono text-[var(--text-secondary)]">
                  {row.f1Th.toFixed(3)}
                </td>
                <td className="py-4 px-3 text-right font-mono text-[var(--text-secondary)]">
                  {row.recallTh.toFixed(3)}
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={`font-mono font-bold tracking-tight ${
                      index === 0
                        ? "text-2xl text-[#0795CF]"
                        : "text-lg text-[var(--text-primary)]"
                    }`}
                  >
                    {row.judgePct.toFixed(1)}
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      %
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
