"use client";

import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

interface RequestSuccessCardProps {
  generator: string;
  embedding: string;
  reranker: string;
  email: string;
  onReset: () => void;
}

export function RequestSuccessCard({
  generator,
  embedding,
  reranker,
  email,
  onReset,
}: RequestSuccessCardProps) {
  const { language } = useLanguage();
  const t = I18N[language].request;
  const isTh = language === "TH";

  const parts: { label: string; value: string; fallback?: string }[] = [
    { label: isTh ? "โมเดล Generator" : "Generator", value: generator.trim() },
    { label: isTh ? "โมเดล Embedding" : "Embedding", value: embedding.trim() },
    { label: isTh ? "โมเดล Reranker" : "Reranker", value: reranker.trim(), fallback: t.noneFallback },
  ];

  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-brand)]/60 p-6 text-center shadow-xs transition-colors sm:p-8">
      <div className="grid size-12 place-items-center rounded-full bg-[var(--brand-cta)] text-xl text-white shadow-xs">
        ✓
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-sans text-2xl font-bold text-[var(--text-primary)]">
          {t.successTitle}
        </h2>
        <p className="max-w-[52ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
          {isTh ? (
            <>
              เราจะส่งอีเมลไปที่{" "}
              <span className="font-mono text-[var(--brand-text)]">{email}</span>{" "}
              ก่อนจัดคิวรันการทดสอบ
            </>
          ) : (
            <>
              We will email{" "}
              <span className="font-mono text-[var(--brand-text)]">{email}</span>{" "}
              before scheduling the run.
            </>
          )}
        </p>
      </div>

      <dl className="grid w-full max-w-xl grid-cols-1 gap-3 text-left sm:grid-cols-[1.4fr_1fr_1fr]">
        {parts.map((part) => (
          <div
            key={part.label}
            className="min-w-0 rounded-xl bg-[var(--background-primary)] px-4 py-3"
          >
            <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              {part.label}
            </dt>
            <dd
              className={`mt-1 break-words font-mono text-sm ${
                part.value ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
              }`}
            >
              {part.value || part.fallback || "—"}
            </dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={onReset}
        className="mt-1 min-h-[44px] cursor-pointer rounded-xl bg-[var(--brand-cta)] px-6 font-sans text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[var(--brand-cta-hover)]"
      >
        {t.submitAnother}
      </button>
    </div>
  );
}
