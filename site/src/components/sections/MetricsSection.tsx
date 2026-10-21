import Link from "next/link";

const METRIC_CARDS = [
  {
    title: "LLM Judge Score",
    tag: "Kimi-K3 · Semantic Quality",
    accent: "var(--brand-sky-blue)",
    description:
      "Automated evaluation by Kimi-K3 rating Thai response accuracy, absence of hallucinations, and semantic alignment with reference QA pairs on a 0–100 scale.",
    formula: "Score = JudgeApproval / TotalEvaluated × 100",
  },
  {
    title: "Thai M-Score (M_th)",
    tag: "Lexical & Word Overlap",
    accent: "var(--brand-turquoise)",
    description:
      "Measures token-level and unigram surface overlap directly against human reference answers in Thai, normalized for Thai word boundaries.",
    formula: "M_th = OverlappingTokens / ReferenceTokens",
  },
  {
    title: "Exact Match (EM)",
    tag: "Strict Correctness",
    accent: "var(--brand-ocean-cyan)",
    description:
      "Strict binary string and token equality against ground-truth reference texts. Crucial for factoid and extraction benchmarks.",
    formula: "EM = 1 if Predicted == GroundTruth else 0",
  },
  {
    title: "Thai F1-Score (F1_th)",
    tag: "Token Balance",
    accent: "var(--brand-sky-blue)",
    description:
      "The harmonic mean of precision and recall over segmented Thai tokens, balancing completeness with conciseness.",
    formula: "F1 = 2 × (Precision × Recall) / (Precision + Recall)",
  },
  {
    title: "Thai Precision & Recall",
    tag: "Completeness & Hallucination",
    accent: "var(--brand-turquoise)",
    description:
      "Precision_th measures what fraction of generated tokens were relevant, while Recall_th measures what fraction of reference tokens were captured.",
    formula: "Precision = Matched / Output | Recall = Matched / Reference",
  },
  {
    title: "Generation Latency",
    tag: "End-to-End Speed",
    accent: "var(--brand-sky-light)",
    description:
      "Execution time in minutes and seconds (m:ss) encompassing the full pipeline: dense embedding retrieval, reranking pass, and LLM text generation.",
    formula: "Latency = t_retrieval + t_rerank + t_generation",
  },
];

export function MetricsSection() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 md:px-12 pt-28 pb-16 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-6 border-b border-[var(--border-default)]">
        <h1 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-[var(--text-primary)]">
          Evaluation Metrics & Protocol
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans max-w-2xl mt-1 leading-relaxed">
          Standardized criteria used to evaluate Thai retrieval-augmented generation pipelines, from token-level alignment to automated LLM judgment.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {METRIC_CARDS.map((card) => (
          <div
            key={card.title}
            className="flex flex-col justify-between p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] hover:border-[var(--brand-sky-light)] transition-all shadow-2xs group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-2">
                <span className="text-xs font-sans uppercase tracking-wider font-bold text-[var(--brand-text)]">
                  {card.tag}
                </span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: card.accent }}
                  aria-hidden="true"
                />
              </div>

              <h2 className="text-lg font-sans font-bold text-[var(--text-primary)] mt-1">
                {card.title}
              </h2>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans mt-2.5 leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-default)]/60">
              <span className="text-xs font-mono text-[var(--text-muted)] block">
                FORMULA / COMPUTATION
              </span>
              <code className="text-xs font-mono text-[var(--text-primary)] bg-[var(--background-subtle)] px-2 py-1 rounded-md block mt-1 overflow-x-auto">
                {card.formula}
              </code>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA to Leaderboard */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--background-subtle)]">
        <div>
          <h3 className="font-sans font-bold text-base text-[var(--text-primary)]">
            Ready to explore the rankings?
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Compare all evaluated combinations and sort by any metric on the live leaderboard.
          </p>
        </div>
        <Link
          href="/"
          className="min-h-[44px] px-5 rounded-xl bg-[var(--brand-cta)] hover:bg-[var(--brand-cta-hover)] text-white text-xs font-sans font-semibold inline-flex items-center justify-center transition-colors shadow-2xs shrink-0"
        >
          View Leaderboard &rarr;
        </Link>
      </div>
    </div>
  );
}
