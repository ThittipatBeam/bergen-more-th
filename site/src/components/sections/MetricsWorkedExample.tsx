"use client";

import {
  MODEL_TOKENS,
  REFERENCE_TOKENS,
  STORY_SCORES,
  WORKED_EXAMPLE,
} from "@/lib/metrics-story";
import type { StoryToken } from "@/types/metrics";
import { useLanguage } from "@/hooks/use-language";

function TokenChip({ token, isTh }: { token: StoryToken; isTh: boolean }) {
  return (
    <span
      lang="th"
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-sans text-sm ${
        token.matched
          ? "border-transparent bg-[var(--positive-bg)] text-[var(--positive)]"
          : "border-dashed border-[var(--negative)] bg-[var(--negative-bg)] text-[var(--negative)]"
      }`}
    >
      <span aria-hidden="true">{token.matched ? "✓" : "≠"}</span>
      <span className="sr-only">
        {token.matched
          ? isTh
            ? "ตรงกัน:"
            : "matches:"
          : isTh
            ? "ต่างกัน:"
            : "differs:"}
      </span>
      {token.text}
    </span>
  );
}

function TokenRow({
  label,
  tokens,
  isTh,
}: {
  label: string;
  tokens: StoryToken[];
  isTh: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
      <span className="w-32 shrink-0 pt-1 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {tokens.map((token) => (
          <TokenChip
            key={`${label}-${token.text}`}
            token={token}
            isTh={isTh}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The story spine of the page: one Thai question, one reference answer, one
 * model answer, and every metric's verdict on the same pair. Values verified
 * against modules/metrics.py — see metrics-story.ts.
 */
export function MetricsWorkedExample() {
  const { language } = useLanguage();
  const isTh = language === "TH";

  return (
    <section
      id="worked-example"
      aria-labelledby="worked-example-title"
      className="flex scroll-mt-28 flex-col gap-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-2xs transition-colors sm:gap-8 sm:p-8"
    >
      <header className="flex flex-col gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
          {isTh ? "ตัวอย่างการคำนวณจริง" : "Worked example"}
        </span>
        <h2
          id="worked-example-title"
          className="font-sans text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl"
        >
          {isTh
            ? "ตัวอย่างการให้คะแนนคำตอบจริงในทุก metric"
            : "Scoring one sample answer across all metrics"}
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-5 rounded-2xl bg-[var(--background-subtle)] p-5 sm:p-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              {isTh ? "คำถาม" : "Question"}
            </span>
            <p
              lang="th"
              className="mt-1 font-sans text-lg font-semibold leading-relaxed text-[var(--text-primary)]"
            >
              {WORKED_EXAMPLE.question.th}
            </p>
            <p
              lang="en"
              className="mt-1 font-sans text-base text-[var(--text-muted)]"
            >
              {WORKED_EXAMPLE.question.en}
            </p>
          </div>

          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              {isTh ? "คำตอบเฉลย (Reference)" : "Answer key"}
            </span>
            <p
              lang="th"
              className="mt-1 font-sans text-base leading-relaxed text-[var(--text-primary)]"
            >
              {WORKED_EXAMPLE.reference.th}
            </p>
            <p
              lang="en"
              className="mt-1 font-sans text-base text-[var(--text-muted)]"
            >
              {WORKED_EXAMPLE.reference.en}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-2xl border border-[var(--brand-sky-light)]/40 bg-[var(--surface-brand)] p-5 sm:p-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              {isTh ? "คำตอบจากโมเดล" : "Model answer"}
            </span>
            <p
              lang="th"
              className="mt-1 font-sans text-base leading-relaxed text-[var(--text-primary)]"
            >
              {WORKED_EXAMPLE.model.th}
            </p>
            <p
              lang="en"
              className="mt-1 font-sans text-base text-[var(--text-muted)]"
            >
              {WORKED_EXAMPLE.model.en}
            </p>
          </div>
          <p className="font-sans text-base leading-relaxed text-[var(--text-secondary)]">
            {isTh
              ? "ความหมายเหมือนกัน แต่สะกดด้วยชื่อย่อ (กรุงเทพฯ แทนที่จะเป็น กรุงเทพมหานคร) คะแนนด้านล่างจะแสดงให้เห็นว่าแต่ละเมทริกซ์ตัดสินจุดนี้ต่างกันอย่างไร"
              : "Both answers have the same meaning, but the model used the abbreviated name (กรุงเทพฯ instead of กรุงเทพมหานคร). The scores below show how each metric treats this difference."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <TokenRow
          label={isTh ? "คำตอบเฉลย" : "Answer key"}
          tokens={REFERENCE_TOKENS}
          isTh={isTh}
        />
        <TokenRow
          label={isTh ? "คำตอบโมเดล" : "Model answer"}
          tokens={MODEL_TOKENS}
          isTh={isTh}
        />
        <p className="font-sans text-sm leading-relaxed text-[var(--text-muted)]">
          {isTh
            ? `PyThaiNLP ตัดคำว่า "ประเทศไทย" ออกเป็น "ประเทศ" และ "ไทย" ดังนั้นคำตอบจึงมีทั้งหมด ${WORKED_EXAMPLE.tokenCount} หน่วยคำ (token)`
            : `PyThaiNLP splits ประเทศไทย into ประเทศ and ไทย, so each answer contains ${WORKED_EXAMPLE.tokenCount} word tokens rather than five.`}
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {STORY_SCORES.map((score) => (
          <li
            key={score.id}
            className="rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] px-4 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-[var(--text-muted)]">
                {score.label}
              </span>
              {score.verdict !== null && (
                <span
                  aria-hidden="true"
                  className={
                    score.verdict
                      ? "text-[var(--positive)]"
                      : "text-[var(--negative)]"
                  }
                >
                  {score.verdict ? "✓" : "✗"}
                </span>
              )}
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-[var(--text-primary)]">
              {score.value}
            </div>
            {score.verdict !== null && (
              <span className="sr-only">
                {score.verdict
                  ? isTh
                    ? "ถูกต้อง"
                    : "correct"
                  : isTh
                    ? "ไม่ตรง"
                    : "not correct"}
              </span>
            )}
          </li>
        ))}
      </ul>

      <p className="font-sans text-sm text-[var(--text-muted)]">
        {isTh
          ? "ตัวเลขในตัวอย่างนี้คำนวณจากคำตอบคู่เดียวเพื่อสาธิตสูตร ผลคะแนนบนลีดเดอร์บอร์ดมาจากการรันจริงทั้ง 500 ข้อ"
          : "The numbers here are computed from this one sample answer; leaderboard scores come from real 500-question runs."}
      </p>
    </section>
  );
}
