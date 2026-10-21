"use client";

import { useState } from "react";

const METRIC_DEFINITIONS = [
  {
    title: "LLM Judge Score",
    tag: "Kimi-K3",
    description:
      "Automated LLM-as-judge scoring Thai answer accuracy, hallucination absence, and semantic correctness against ground-truth QA pairs.",
  },
  {
    title: "Thai M-Score (M_th)",
    tag: "Lexical Overlap",
    description:
      "Word- and token-level lexical overlap measuring direct surface-form alignment with human reference answers in Thai.",
  },
  {
    title: "Exact Match & F1 (TH)",
    tag: "Token Accuracy",
    description:
      "Binary exact match (EM) and harmonic mean (F1) over segmented Thai tokens, balancing precision and recall.",
  },
  {
    title: "Reranker Delta",
    tag: "Pipeline Efficiency",
    description:
      "Measures the accuracy gain and latency trade-off when adding a cross-encoder reranking pass over dense vector embeddings.",
  },
];

export function MetricsGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-4 sm:p-5 transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between text-left cursor-pointer min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0795CF]" />
          <span className="font-mono text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
            How to read these Thai RAG metrics
          </span>
        </div>

        <span className="font-mono text-xs text-[var(--text-muted)] inline-flex items-center gap-1">
          <span>{isOpen ? "Hide guide" : "Show guide"}</span>
          <span>{isOpen ? "▴" : "▾"}</span>
        </span>
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 mt-2 border-t border-[var(--border-default)]/60">
          {METRIC_DEFINITIONS.map((m) => (
            <div
              key={m.title}
              className="rounded-xl border border-[var(--border-default)]/60 bg-[var(--background-subtle)] p-3 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0795CF] font-semibold">
                  {m.tag}
                </span>
                <h4 className="font-mono text-xs font-bold text-[var(--text-primary)] mt-1">
                  {m.title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] font-sans mt-1.5 leading-relaxed">
                  {m.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}