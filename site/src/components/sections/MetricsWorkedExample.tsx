"use client";

import {
  MODEL_TOKENS,
  REFERENCE_TOKENS,
  STORY_SCORES,
  WORKED_EXAMPLE,
} from "@/lib/metrics-story";
import type { StoryToken } from "@/types/metrics";
import { useLanguage } from "@/hooks/use-language";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CARD } from "@/lib/design";

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

interface TextRowProps {
  label: string;
  th: string;
  en: string;
  strong?: boolean;
}

function TextRow({ label, th, en, strong = false }: TextRowProps) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-[var(--border-default)] py-3 last:border-b-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4 sm:py-4">
      <span className="pt-0.5 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
      <div className="min-w-0">
        <p
          lang="th"
          className={`font-sans leading-relaxed text-[var(--text-primary)] ${
            strong ? "text-base font-semibold" : "text-base"
          }`}
        >
          {th}
        </p>
        <p lang="en" className="mt-0.5 font-sans text-sm text-[var(--text-muted)]">
          {en}
        </p>
      </div>
    </div>
  );
}

/**
 * One Thai question, one reference answer, one model answer, and every
 * metric's verdict on the same pair. Values verified against
 * modules/metrics.py — see metrics-story.ts.
 */
export function MetricsWorkedExample() {
  const { language } = useLanguage();
  const isTh = language === "TH";

  return (
    <section
      id="worked-example"
      aria-labelledby="worked-example-title"
      className={`flex scroll-mt-28 flex-col gap-6 ${CARD}`}
    >
      <SectionHeading
        id="worked-example-title"
        title={isTh ? "ตัวอย่างการคำนวณจริง" : "Worked example"}
      />

      <div className="rounded-2xl bg-[var(--background-subtle)] px-5 sm:px-6">
        <TextRow
          label={isTh ? "คำถาม" : "Question"}
          th={WORKED_EXAMPLE.question.th}
          en={WORKED_EXAMPLE.question.en}
          strong
        />
        <TextRow
          label={isTh ? "เฉลย" : "Answer key"}
          th={WORKED_EXAMPLE.reference.th}
          en={WORKED_EXAMPLE.reference.en}
        />
        <TextRow
          label={isTh ? "คำตอบโมเดล" : "Model answer"}
          th={WORKED_EXAMPLE.model.th}
          en={WORKED_EXAMPLE.model.en}
        />
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
            ? `PyThaiNLP ตัดคำว่า "ประเทศไทย" ออกเป็น "ประเทศ" และ "ไทย" จึงนับได้ทั้งหมด ${WORKED_EXAMPLE.tokenCount} หน่วยคำ (token)`
            : `PyThaiNLP splits ประเทศไทย into ประเทศ and ไทย, so each answer counts ${WORKED_EXAMPLE.tokenCount} word tokens rather than five.`}
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
          ? "เลขในตัวอย่างนี้คำนวณจากคำตอบคู่เดียวเพื่อโชว์วิธีคิด คะแนนบนลีดเดอร์บอร์ดมาจากการรันจริง 500 ข้อ"
          : "The numbers here are computed from this one sample answer; leaderboard scores come from real 500-question runs."}
      </p>
    </section>
  );
}
