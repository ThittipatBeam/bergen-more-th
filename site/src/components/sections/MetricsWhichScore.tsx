"use client";

import Link from "next/link";
import { getWhichScoreRows } from "@/lib/metrics-guide";
import { useLanguage } from "@/hooks/use-language";

/** The cheat sheet: match the reader's question to a metric, then the warning. */
export function MetricsWhichScore() {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const rows = getWhichScoreRows(language);

  return (
    <section
      aria-labelledby="which-score-title"
      className="flex flex-col gap-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-subtle)] p-6 transition-colors sm:gap-8 sm:p-8"
    >
      <header className="flex flex-col gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
          {isTh ? "สรุปวิธีเลือกใช้" : "Cheat sheet"}
        </span>
        <h2
          id="which-score-title"
          className="font-sans text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl"
        >
          {isTh ? "ควรดูคะแนนตัวไหนดี" : "Which score should I use?"}
        </h2>
      </header>

      {/* Column headings exist only in the sm+ grid layout. */}
      <div
        aria-hidden="true"
        className="hidden border-b border-[var(--border-default)] pb-2 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] sm:grid sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.65fr)_minmax(0,1.2fr)] sm:gap-6"
      >
        <span>{isTh ? "ความต้องการของคุณ…" : "If you need…"}</span>
        <span>{isTh ? "metric ที่ใช้" : "Use"}</span>
        <span>{isTh ? "เหตุผล" : "Because"}</span>
      </div>

      <ul className="flex flex-col">
        {rows.map((row) => (
          <li
            key={row.need}
            className="flex flex-col gap-1 border-b border-[var(--border-default)] py-4 last:border-b-0 sm:grid sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.65fr)_minmax(0,1.2fr)] sm:items-baseline sm:gap-6"
          >
            <span className="font-sans text-base font-semibold text-[var(--text-primary)]">
              {row.need}
            </span>
            <span className="font-mono text-sm text-[var(--brand-text)]">
              {row.use}
            </span>
            <span className="font-sans text-base leading-7 text-[var(--text-secondary)]">
              {row.why}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 max-w-[44ch] font-sans text-sm leading-relaxed text-[var(--text-muted)]">
          {isTh
            ? "ทุกตัวเลขบนลีดเดอร์บอร์ดมาจากการทดสอบบนคำถาม Thai Wikipedia 500 ข้อเดียวกัน"
            : "Every number on the board comes from the same 500 Thai Wikipedia questions."}
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Link
            href="/#leaderboard"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--brand-cta)] px-5 font-sans text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[var(--brand-cta-hover)]"
          >
            {isTh ? "ดูผลบนลีดเดอร์บอร์ด →" : "View the leaderboard →"}
          </Link>
          <Link
            href="/request"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] px-5 font-sans text-sm font-semibold text-[var(--text-primary)] shadow-2xs transition-colors"
          >
            {isTh ? "ส่งโมเดลเข้าทดสอบ" : "Request a run"}
          </Link>
        </div>
      </div>
    </section>
  );
}
