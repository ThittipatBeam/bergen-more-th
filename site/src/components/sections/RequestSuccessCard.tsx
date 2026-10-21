interface RequestSuccessCardProps {
  generator: string;
  retriever: string;
  reranker: string;
  onReset: () => void;
}

export function RequestSuccessCard({
  generator,
  retriever,
  reranker,
  onReset,
}: RequestSuccessCardProps) {
  return (
    <div className="p-8 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-brand)]/60 flex flex-col items-center text-center gap-4 transition-all shadow-xs">
      <div className="w-12 h-12 rounded-full bg-[var(--brand-cta)] text-white flex items-center justify-center text-xl shadow-xs">
        ✓
      </div>
      <div>
        <h2 className="text-xl font-sans font-bold text-[var(--text-primary)]">
          Benchmark Request Queued!
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mt-1.5 leading-relaxed">
          Your requested combination (
          <span className="font-mono font-bold text-[var(--brand-text)]">{generator}</span> +{" "}
          <span className="font-mono font-bold text-[var(--brand-text)]">{retriever}</span>
          {reranker !== "none" ? ` + ${reranker}` : ""}) will be scheduled for the next evaluation batch.
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="min-h-[44px] px-6 rounded-xl bg-[var(--brand-cta)] hover:bg-[var(--brand-cta-hover)] text-white text-sm font-sans font-semibold transition-colors mt-2 cursor-pointer shadow-2xs"
      >
        Submit Another Combination
      </button>
    </div>
  );
}
