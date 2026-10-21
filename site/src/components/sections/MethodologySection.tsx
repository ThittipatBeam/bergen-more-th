import Link from "next/link";

const METHODOLOGY_PILLARS = [
  {
    step: "01",
    title: "Tri-Component Architecture",
    badge: "System Design",
    description:
      "Every Thai RAG pipeline under evaluation is decomposed into three strictly isolated components: dense embedding retriever, cross-encoder neural reranker, and generator LLM.",
    details: [
      "Dense vector search over segmented Thai text passages",
      "Optional cross-encoder reranking pass for semantic precision",
      "Context-grounded generative answer synthesis",
    ],
  },
  {
    step: "02",
    title: "Curated Thai Datasets",
    badge: "Evaluation Corpus",
    description:
      "Evaluations run on standardized Thai knowledge corpora including ThaiWikiV4 and MKQA/th, reflecting both general-knowledge and specialized inquiry contexts.",
    details: [
      "Target corpus passages formatted and tokenized with PyThaiNLP",
      "Verified ground-truth answer spans and reference texts",
      "Strict separation of dev, test, and evaluation splits",
    ],
  },
  {
    step: "03",
    title: "Deterministic LLM-as-a-Judge",
    badge: "Scoring Protocol",
    description:
      "Responses are evaluated by KIMI-K3 operating with zero-temperature sampling to eliminate variance and score semantic correctness objectively.",
    details: [
      "Checks for hallucination against retrieved context",
      "Evaluates Thai language fluency and natural grammar",
      "Compares output against multi-reference human answers",
    ],
  },
];

export function MethodologySection() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 md:px-12 pt-28 pb-16 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-6 border-b border-[var(--border-default)]">
        <h1 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-[var(--text-primary)]">
          Evaluation Methodology
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans max-w-2xl mt-1 leading-relaxed">
          How we evaluate and rank Thai Retrieval-Augmented Generation systems using transparent, reproducible pipelines.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {METHODOLOGY_PILLARS.map((pillar) => (
          <div
            key={pillar.step}
            className="flex flex-col justify-between p-6 rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] hover:border-[var(--brand-sky-light)] transition-all shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-3">
                <span className="font-mono text-xs font-bold text-[var(--brand-text)]">
                  {pillar.step}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-sans font-semibold bg-[var(--brand-sky-blue)]/15 text-[var(--brand-text)]">
                  {pillar.badge}
                </span>
              </div>

              <h2 className="text-lg font-sans font-bold text-[var(--text-primary)]">
                {pillar.title}
              </h2>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans mt-2.5 leading-relaxed">
                {pillar.description}
              </p>
            </div>

            <ul className="mt-5 pt-4 border-t border-[var(--border-default)]/60 flex flex-col gap-2">
              {pillar.details.map((detail) => (
                <li
                  key={detail}
                  className="text-xs font-sans text-[var(--text-muted)] flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-sky-blue)] mt-1.5 shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pipeline Flow Banner */}
      <div className="p-6 rounded-2xl border border-[var(--border-default)] bg-[var(--background-subtle)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-sans font-bold text-lg text-[var(--text-primary)]">
            Open-Source Experiment Scripts
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mt-1">
            All evaluation runs, prompt templates, and raw metric extraction scripts are maintained in the repository for auditability.
          </p>
        </div>

        <Link
          href="/request"
          className="min-h-[44px] px-5 rounded-xl bg-[var(--brand-cta)] hover:bg-[var(--brand-cta-hover)] text-white text-xs font-sans font-semibold inline-flex items-center justify-center transition-colors shadow-2xs shrink-0 whitespace-nowrap"
        >
          Request Custom Run &rarr;
        </Link>
      </div>
    </div>
  );
}
