"use client";

import Link from "next/link";
import { QUALITY_WEIGHTS } from "@/lib/benchmark-data";
import { MathFormula } from "@/components/ui/MathFormula";
import { useLanguage } from "@/hooks/use-language";

export function MetricsOverallScore() {
  const { language } = useLanguage();
  const isTh = language === "TH";

  const weightRows = [
    {
      key: "judgePct" as const,
      metric: "Judge",
      why: isTh
        ? "เป็นคะแนนเดียวที่ยอมรับการตอบถูกด้วยการ Paraphrase (เขียนเรียบเรียงใหม่)"
        : "the only score that accepts a correct paraphrase",
    },
    {
      key: "mTh" as const,
      metric: "Match TH",
      why: isTh
        ? "คำตอบเฉลยทั้งหมดปรากฏครบถ้วนในข้อความ"
        : "the whole gold answer is present",
    },
    {
      key: "f1Th" as const,
      metric: "F1 TH",
      why: isTh
        ? "คำนวณ Word Overlap ให้คะแนนตามสัดส่วนคำที่ถูกต้อง"
        : "graded word overlap, so partial credit counts",
    },
    {
      key: "em" as const,
      metric: "Exact Match",
      why: isTh
        ? "ข้อความตรงกันแบบคำต่อคำ — เกณฑ์ขั้นต่ำที่เข้มงวดที่สุด"
        : "an exact string — the strict floor",
    },
  ];

  return (
    <section
      id="overall-score"
      aria-labelledby="overall-score-title"
      className="flex scroll-mt-28 flex-col gap-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 transition-colors sm:gap-8 sm:p-8"
    >
      <header className="flex flex-col gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
          {isTh ? "คะแนนรวม Overall Score" : "Overall score"}
        </span>
        <h2
          id="overall-score-title"
          className="font-sans text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl"
        >
          {isTh ? "วิธีคำนวณคะแนนรวม" : "How we combine them"}
        </h2>
        <p className="max-w-[58ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
          {isTh
            ? "ลีดเดอร์บอร์ดจัดอันดับด้วยคะแนน Overall Score ซึ่งถ่วงน้ำหนักจาก 4 มิติวัดความถูกต้องด้านบน"
            : "The leaderboard ranks by one overall score — a weighted blend of the four correctness scores above."}
        </p>
      </header>

      {/* One line wherever it fits; below that the expression breaks after the
          second term so it never scrolls sideways on a phone. */}
      <MathFormula
        label={isTh ? "สูตรคำนวณ Overall score" : "Overall score formula"}
        tex="\text{Overall} = 0.45\,\text{Judge} + 0.20\,M_{th} + 0.20\,F1_{th} + 0.15\,\text{EM}"
        className="hidden rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] px-2 lg:block"
      />
      <MathFormula
        label={isTh ? "สูตรคำนวณ Overall score" : "Overall score formula"}
        tex="\begin{aligned}\text{Overall} = {}&0.45\,\text{Judge} + 0.20\,M_{th}\\ &+ 0.20\,F1_{th} + 0.15\,\text{EM}\end{aligned}"
        className="rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] px-2 lg:hidden"
      />

      <dl className="flex flex-col border-t border-[var(--border-default)]">
        {weightRows.map((row) => (
          <div
            key={row.key}
            className="flex flex-col gap-1 border-b border-[var(--border-default)] py-4 last:border-b-0 sm:grid sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-baseline sm:gap-6"
          >
            <dt className="flex items-baseline gap-2">
              <span className="font-mono text-base font-bold text-[var(--brand-text)]">
                {Math.round(QUALITY_WEIGHTS[row.key] * 100)}%
              </span>
              <span className="font-sans text-base font-semibold text-[var(--text-primary)]">
                {row.metric}
              </span>
            </dt>
            <dd className="font-sans text-base leading-7 text-[var(--text-secondary)]">
              {row.why}
            </dd>
          </div>
        ))}
      </dl>

      <p className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">
          {isTh ? "เหตุผลของการถ่วงน้ำหนัก. " : "Why these weights. "}
        </span>
        {isTh
          ? "Judge ได้สัดส่วนสูงสุดเพราะยอมรับคำตอบที่ถูกแต่ใช้คำต่างจากเฉลย ส่วน EM ได้สัดส่วนน้อยที่สุดเพราะคำตอบที่ถูกแต่เรียบเรียงต่างไปจะได้ 0 คะแนน"
          : "Judge gets the largest share because a correct answer in different words still earns it; EM gets the smallest because the same answer scores 0."}
      </p>

      <p className="max-w-[62ch] border-l-2 border-[var(--perf-text)] pl-4 font-sans text-base leading-7 text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">
          {isTh ? "ไม่นำความเร็วมาคิดใน Overall score. " : "Speed is not in the overall score. "}
        </span>
        {isTh
          ? "ไปป์ไลน์ที่เร็วกว่าไม่ได้แปลว่าตอบถูกกว่าเสมอไป เวลา Generation จึงแยกเป็นคอลัมน์ของตัวเองเพื่อให้คุณเลือกจัดอันดับตามสิ่งที่สำคัญต่อโปรเจกต์ของคุณได้"
          : "A faster pipeline is not more correct. Generation time stays its own axis, and the board keeps every column so you can re-rank on the one you care about."}
      </p>

      <Link
        href="/#leaderboard"
        className="inline-flex min-h-[44px] w-fit items-center font-sans text-sm font-semibold text-[var(--brand-text)] transition-colors hover:text-[var(--brand-cta-hover)]"
      >
        {isTh ? "ดูคะแนน Overall Score บนลีดเดอร์บอร์ด →" : "See the overall score on the leaderboard →"}
      </Link>
    </section>
  );
}
