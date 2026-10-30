"use client";

import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";
import { BODY, BUTTON_PRIMARY, H2, MEASURE_NOTE } from "@/lib/design";

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
      <div className="animate-in zoom-in-75 grid size-12 place-items-center rounded-full bg-[var(--brand-cta)] text-xl text-white shadow-xs duration-300 motion-reduce:animate-none">
        ✓
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-col gap-2 duration-300 [animation-delay:120ms] motion-reduce:animate-none">
        <h2 className={`${H2} text-[var(--text-primary)]`}>
          {t.successTitle}
        </h2>
        <p className={`${BODY} ${MEASURE_NOTE} text-[var(--text-secondary)]`}>
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
        className={`mt-1 cursor-pointer ${BUTTON_PRIMARY}`}
      >
        {t.submitAnother}
      </button>
    </div>
  );
}
