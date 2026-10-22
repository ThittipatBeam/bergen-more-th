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
      ? `Recall อยู่ที่ ${recall.min.toFixed(0)}–${recall.max.toFixed(0)}%, ` +
        `ขณะที่ Precision อยู่ที่ ${precision.min.toFixed(0)}–${precision.max.toFixed(0)}% ` +
        "โมเดลค้นหาคำที่ถูกต้องเจอ แต่มีแนวโน้มจะเขียนขยายความเพิ่ม"
      : `recall sits at ${recall.min.toFixed(0)}–${recall.max.toFixed(0)}%, ` +
        `while precision sits at ${precision.min.toFixed(0)}–${precision.max.toFixed(0)}%. ` +
        "Models find the right words, then keep writing.";
  }

  const examples: Partial<Record<MetricId, string>> = generation
    ? {
        generation: isTh
          ? `ตารางปัจจุบันครอบคลุมช่วงเวลา ${formatClock(
              generation.min
            )}–${formatClock(generation.max)} สำหรับคำตอบทั้ง ${JUDGE_N} ข้อ`
          : `Today's board spans ${formatClock(
              generation.min
            )}–${formatClock(generation.max)} for all ${JUDGE_N} answers.`,
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
        kicker={isTh ? "คำอธิบายเมทริกซ์การวัดผล" : "Metrics, explained"}
        title={isTh ? "1 คำถาม 7 มิติการวัดผล" : "One question, seven scores"}
        lead={
          isTh
            ? "เราส่งคำถามภาษาไทย 1 ข้อ แล้ววัดผลคำตอบเดียวกันใน 3 มิติ: ตอบถูกไหม, คำตรงกับเฉลยแค่ไหน และตอบเร็วเท่าใด"
            : "We ask one Thai question, then grade the same answer three ways: is it right, how close are the words, how fast."
        }
        meta={
          isTh
            ? `${JUDGE_N} คำถาม · ThaiWikiV4 · ตัดสินโดย ${JUDGE_NAME}`
            : `${JUDGE_N} questions · ThaiWikiV4 · judge ${JUDGE_NAME}`
        }
        action={
          <Link
            href="/methodology#worked-example"
            className="inline-flex min-h-[44px] items-center font-sans text-sm font-semibold text-[var(--brand-text)] transition-colors hover:text-[var(--brand-cta-hover)]"
          >
            {isTh
              ? "ดูตัวอย่างการให้คะแนนจริงในทุกเมทริกซ์ →"
              : "See how one answer scores on every metric →"}
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
