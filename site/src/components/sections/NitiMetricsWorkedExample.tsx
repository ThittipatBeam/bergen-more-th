"use client";

import {
  NITI_STORY_SCORES,
  NITI_WORKED_EXAMPLE,
} from "@/lib/nitibench-metrics-story";
import {
  ScoreStrip,
  TextRow,
} from "@/components/ui/WorkedExampleParts";
import { useLanguage } from "@/hooks/use-language";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CARD } from "@/lib/design";

/**
 * One real benchmark case, the court's call, one model answer, and every
 * NitiBench metric's verdict on it. Question and court answer come from the
 * dataset; the grade is illustrative — see nitibench-metrics-story.ts.
 */
export function NitiMetricsWorkedExample() {
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
        title={isTh ? "ตัวอย่างการเกรดจริง" : "Worked example"}
      />

      <div className="rounded-2xl bg-[var(--background-subtle)] px-5 sm:px-6">
        <TextRow
          label={isTh ? "คำถามย่อย" : "Sub-question"}
          th={NITI_WORKED_EXAMPLE.question.th}
          en={NITI_WORKED_EXAMPLE.question.en}
          strong
        />
        <TextRow
          label={isTh ? "คำตอบของศาล" : "Court's call"}
          th={NITI_WORKED_EXAMPLE.reference.th}
          en={NITI_WORKED_EXAMPLE.reference.en}
        />
        <TextRow
          label={isTh ? "คำตอบโมเดล" : "Model answer"}
          th={NITI_WORKED_EXAMPLE.model.th}
          en={NITI_WORKED_EXAMPLE.model.en}
        />
      </div>

      <ScoreStrip scores={NITI_STORY_SCORES} isTh={isTh} />

      <p className="font-sans text-sm text-[var(--text-muted)]">
        {isTh
          ? "คำถามและคำตอบของศาลมาจากชุดข้อมูลจริง คะแนน rubric ในตัวอย่างนี้ไม่ใช่เกรดที่บันทึกไว้ ใช้สาธิตวิธีคิด เกรดจริงแกว่งประมาณ 0.4–0.5 คะแนนจาก judge ทุกครั้งที่รัน"
          : "The question and the court's call come from the dataset; the rubric grade here is illustrative, not a logged run. Real grades swing about 0.4 to 0.5 points between repeats."}
      </p>
    </section>
  );
}
