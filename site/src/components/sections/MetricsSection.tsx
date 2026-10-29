"use client";

import Link from "next/link";
import {
  BENCHMARK_ROWS,
  formatClock,
  JUDGE_NAME,
  JUDGE_N,
} from "@/lib/benchmark-data";
import { getMetricChapters } from "@/lib/metrics-data";
import type { MetricChapter, MetricId } from "@/types/metrics";
import { MetricsChapter as ChapterBlock } from "./MetricsChapter";
import { MetricsOverallScore } from "./MetricsOverallScore";
import { MetricsWhichScore } from "./MetricsWhichScore";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/hooks/use-language";

const rangeOf = (values: number[]) =>
  values.length ? { min: Math.min(...values), max: Math.max(...values) } : null;

/** Live sentences for the two chapters whose meaning changes with the board. */
function buildInsights(isTh: boolean) {
  const precision = rangeOf(BENCHMARK_ROWS.map((row) => row.precisionTh));
  const recall = rangeOf(BENCHMARK_ROWS.map((row) => row.recallTh));
  const generation = rangeOf(
    BENCHMARK_ROWS.map((row) => row.genSeconds).filter(
      (seconds): seconds is number => seconds !== null
    )
  );

  const insights: Partial<Record<MetricChapter["id"], string>> = {};

  if (precision && recall) {
    insights["word-overlap"] = isTh
      ? `Recall อยู่ที่ ${recall.min.toFixed(0)}% ถึง ${recall.max.toFixed(0)}%, ` +
        `ขณะที่ Precision อยู่ที่ ${precision.min.toFixed(0)}% ถึง ${precision.max.toFixed(0)}% ` +
        "โมเดลส่วนใหญ่ตอบคำสำคัญถูก แต่เขียนขยายความเพิ่มจนทำให้ precision ลดลง"
      : `Recall ranges from ${recall.min.toFixed(0)}% to ${recall.max.toFixed(0)}%, ` +
        `while precision ranges from ${precision.min.toFixed(0)}% to ${precision.max.toFixed(0)}%. ` +
        "Most models locate the right words, then add extra phrasing that reduces precision.";
  }

  const examples: Partial<Record<MetricId, string>> = generation
    ? {
        generation: isTh
          ? `ตารางปัจจุบันครอบคลุมช่วงเวลา ${formatClock(
              generation.min
            )} ถึง ${formatClock(generation.max)} สำหรับคำตอบทั้ง ${JUDGE_N} ข้อ`
          : `Current runs span ${formatClock(
              generation.min
            )} to ${formatClock(generation.max)} across all ${JUDGE_N} answers.`,
      }
    : {};

  return { insights, examples };
}

export function MetricsSection() {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const { insights, examples } = buildInsights(isTh);
  const chapters = getMetricChapters(language);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 pt-28 pb-20 sm:gap-16 sm:px-8 md:px-12">
      <PageHeader
        kicker={isTh ? "คู่มือการอ่านคะแนน" : "Metrics guide"}
        title={isTh ? "1 คำถาม 7 metric" : "One question, seven metrics"}
        lead={
          isTh
            ? "เราส่งคำถามภาษาไทย 1 ข้อ แล้วตรวจคำตอบเดียวกันใน 3 ด้าน: ความถูกต้องตามความหมาย, ความตรงกับเฉลยคำต่อคำ และความเร็วในการเขียน"
            : "We run each Thai question through the pipeline and evaluate the answer across three areas: factual correctness, word overlap against the reference, and generation speed."
        }
        meta={
          isTh
            ? `${JUDGE_N} คำถาม · ThaiWikiV4 · ตรวจโดย ${JUDGE_NAME}`
            : `${JUDGE_N} questions · ThaiWikiV4 · judged by ${JUDGE_NAME}`
        }
        action={
          <Link
            href="/methodology#worked-example"
            className="inline-flex min-h-[44px] items-center font-sans text-sm font-semibold text-[var(--brand-text)] transition-colors hover:text-[var(--brand-cta-hover)]"
          >
            {isTh
              ? "ดูตัวอย่างการคำนวณคะแนนจริงทุก metric →"
              : "See how one answer scores across every metric →"}
          </Link>
        }
      />

      {chapters.map((chapter) => (
        <ChapterBlock
          key={chapter.id}
          chapter={chapter}
          insight={insights[chapter.id]}
          examples={examples}
        />
      ))}

      <MetricsOverallScore />

      <MetricsWhichScore />
    </div>
  );
}
