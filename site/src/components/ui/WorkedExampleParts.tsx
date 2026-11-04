"use client";

import type { StoryScore } from "@/types/metrics";

interface TextRowProps {
  label: string;
  th: string;
  en: string;
  strong?: boolean;
}

/** One labeled passage of the worked example, Thai on top, English below. */
export function TextRow({ label, th, en, strong = false }: TextRowProps) {
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

interface ScoreStripProps {
  scores: StoryScore[];
  isTh: boolean;
  className?: string;
}

/** Every metric's verdict on the example, small tiles in one row. */
export function ScoreStrip({ scores, isTh, className = "" }: ScoreStripProps) {
  return (
    <ul className={`grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 ${className}`}>
      {scores.map((score) => (
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
  );
}
