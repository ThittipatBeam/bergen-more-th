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
        ? "เป็นเกณฑ์เดียวที่ยอมรับคำตอบที่ถูกต้องแม้จะเขียนเรียบเรียงใหม่ด้วยคำอื่น"
        : "the only metric that accepts correct answers phrased in different words",
    },
    {
      key: "mTh" as const,
      metric: "Match TH",
      why: isTh
        ? "ตรวจว่ามีข้อความเฉลยครบทุกคำในคำตอบ"
        : "verifies that the entire gold answer appears in the text",
    },
    {
      key: "f1Th" as const,
      metric: "F1 TH",
      why: isTh
        ? "วัดสัดส่วนคำที่ตรงกับเฉลย ให้คะแนนตามสัดส่วนคำที่ตอบถูก"
        : "measures word overlap, awarding partial credit for matched words",
    },
    {
      key: "em" as const,
      metric: "Exact Match",
      why: isTh
        ? "ข้อความต้องตรงกับเฉลยทุกตัวอักษร เป็นเกณฑ์ที่เข้มงวดที่สุด"
        : "requires an exact string match, providing the strictest baseline",
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
          {isTh ? "วิธีคำนวณคะแนนรวม" : "How we combine scores"}
        </h2>
        <p className="max-w-[58ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
          {isTh
            ? "ตารางจัดอันดับด้วยคะแนนรวม Overall Score ซึ่งถ่วงน้ำหนักจากเกณฑ์วัดความถูกต้องทั้ง 4 ด้าน"
            : "The leaderboard ranks pipelines by one overall score, combining the four correctness metrics above with specific weights."}
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
        {isTh
          ? "Judge ได้สัดส่วนสูงสุดเพราะยอมรับคำตอบที่ถูกแต่ใช้คำต่างจากเฉลย ส่วน EM ได้สัดส่วนน้อยที่สุดเพราะคำตอบที่ตอบถูกแต่เรียบเรียงต่างไปจะได้ 0 ทันที"
          : "The judge score receives the largest share because it recognizes correct answers that use different phrasing. EM receives the smallest share because paraphrased answers score zero."}
      </p>

      <p className="max-w-[62ch] border-l-2 border-[var(--perf-text)] pl-4 font-sans text-base leading-7 text-[var(--text-secondary)]">
        {isTh
          ? "เวลาสร้างคำตอบไม่เข้าสูตรคะแนนรวม และไม่มีผลกับอันดับ คงไว้เป็นคอลัมน์แยกเพื่อให้เรียงตามความเร็วได้เมื่อระบบของคุณสนใจ latency"
          : "Generation time never enters the overall score and cannot change the ranking. It stays in its own column so you can sort by speed when latency matters for your use case."}
      </p>

      <Link
        href="/#leaderboard"
        className="inline-flex min-h-[44px] w-fit items-center font-sans text-sm font-semibold text-[var(--brand-text)] transition-colors hover:text-[var(--brand-cta-hover)]"
      >
        {isTh ? "ดูคะแนนรวมบนลีดเดอร์บอร์ด →" : "See the overall score on the leaderboard →"}
      </Link>
    </section>
  );
}
