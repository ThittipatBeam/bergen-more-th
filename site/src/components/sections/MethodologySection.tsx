"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { JUDGE_NAME } from "@/lib/benchmark-data";
import {
  DATASET_SIZE,
  getMethodologyChapters,
  getScoringProtocol,
  getSystemDesign,
} from "@/lib/methodology-data";
import { MetricsWorkedExample } from "@/components/sections/MetricsWorkedExample";
import { MethodologyChapter } from "@/components/sections/MethodologyChapter";
import { MethodologyPillar } from "@/components/sections/MethodologyPillar";
import { PipelineFlow } from "@/components/sections/PipelineFlow";
import { DatasetStory } from "@/components/sections/DatasetStory";
import { ScoringChips } from "@/components/sections/ScoringChips";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmoothScrollLink } from "@/components/ui/SmoothScrollLink";
import { useLanguage } from "@/hooks/use-language";

function Payoff({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
      {children}
    </p>
  );
}

export function MethodologySection() {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const chapters = getMethodologyChapters(language);
  const { systemDesign, questionBank, scoring } = chapters;
  const systemDesignBlock = getSystemDesign(language);
  const scoringProtocolBlock = getScoringProtocol(language);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 pt-28 pb-20 sm:gap-16 sm:px-8 md:px-12">
      <PageHeader
        kicker={isTh ? "ระเบียบวิธีวิจัยและขั้นตอนทดสอบ" : "Methodology overview"}
        title={isTh ? "ที่มาของชุดข้อมูลและวิธีตรวจคะแนน" : "How the benchmark is built and scored"}
        lead={
          isTh
            ? "ไปป์ไลน์ RAG ค้นหาเอกสารและตอบคำถาม จากนั้น LLM judge จะตรวจว่าคำตอบถูกต้องหรือไม่ อธิบายสั้นๆ ใน 3 ขั้นตอน"
            : "A pipeline answers a question, and an LLM judge decides whether the answer is correct. Here is how each part works across three sections."
        }
        meta={
          isTh
            ? `${DATASET_SIZE.bank.toLocaleString("th-TH")} คำถามในคลัง · ${DATASET_SIZE.perRun} ข้อต่อหนึ่งรัน · ตรวจด้วย ${JUDGE_NAME}`
            : `${DATASET_SIZE.bank.toLocaleString("en-US")} questions in the bank · ${DATASET_SIZE.perRun} per run · judged by ${JUDGE_NAME}`
        }
        action={
          <SmoothScrollLink
            href="#worked-example"
            className="inline-flex min-h-[44px] items-center font-sans text-sm font-semibold text-[var(--brand-text)] transition-colors hover:text-[var(--brand-cta-hover)]"
          >
            {isTh
              ? "ดูตัวอย่างการคำนวณคะแนนทุกเมทริกซ์ →"
              : "See one sample answer scored across all metrics →"}
          </SmoothScrollLink>
        }
      />

      <MethodologyChapter chapter={systemDesign}>
        <MethodologyPillar
          block={systemDesignBlock}
          accent={systemDesign.accent}
        />
        <PipelineFlow accent={systemDesign.accent} />
        <Payoff>
          <span className="font-semibold text-[var(--text-primary)]">
            {isTh ? "สรุปใจความสำคัญ: " : "Takeaway: "}
          </span>
          {isTh
            ? "โครงสร้างไปป์ไลน์ 3 ขั้นตอนคงที่เหมือนกันทุกรัน เปลี่ยนเฉพาะโมเดลข้างใน จึงเปรียบเทียบผลลัพธ์ระหว่างโมเดลได้อย่างเป็นธรรม"
            : "The three-stage pipeline remains identical across runs, changing only the models inside. This keeps comparisons consistent."}
        </Payoff>
      </MethodologyChapter>

      <MethodologyChapter chapter={questionBank}>
        <DatasetStory />
      </MethodologyChapter>

      <MethodologyChapter chapter={scoring}>
        <MethodologyPillar
          block={scoringProtocolBlock}
          accent={scoring.accent}
        />
        <ScoringChips />
        <Payoff>
          <span className="font-semibold text-[var(--text-primary)]">
            {isTh ? "สรุปใจความสำคัญ: " : "Takeaway: "}
          </span>
          {isTh
            ? "คะแนนจาก judge มีสัดส่วน 45% ของคะแนนรวม เพื่อประเมินความถูกต้องตามความหมายจริง "
            : "The judge score makes up 45% of the overall score, measuring factual correctness in natural language. "}
          <Link
            href="/metrics#overall-score"
            className="font-semibold text-[var(--brand-text)] underline-offset-2 transition-colors hover:text-[var(--brand-cta-hover)] hover:underline"
          >
            {isTh ? "ดูวิธีคำนวณคะแนนทั้งหมด" : "See how the rest is scored"}
          </Link>
          .
        </Payoff>
      </MethodologyChapter>

      {/* One answer, every score: the worked example closes the story. */}
      <MetricsWorkedExample />

      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-subtle)] p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
            {isTh ? "รันการทดสอบและโค้ดทั้งหมดได้จาก repo" : "Everything runs from the repo"}
          </h2>
          <p className="mt-2 max-w-[58ch] font-sans text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            {isTh ? (
              <>
                สคริปต์สำหรับสร้างชุดข้อมูลอยู่ในโฟลเดอร์{" "}
                <code className="font-mono text-[0.95em] text-[var(--text-primary)]">
                  th_data_gen/
                </code>{" "}
                และระบบรันประเมินผลใช้เฟรมเวิร์ก Bergen แต่ละรอบจะบันทึกการตั้งค่าและผลลัพธ์ดิบไว้ทั้งหมด ทุกคนจึงสามารถนำไปรันซ้ำได้
              </>
            ) : (
              <>
                The dataset scripts live in{" "}
                <code className="font-mono text-[0.95em] text-[var(--text-primary)]">
                  th_data_gen/
                </code>{" "}
                for generation, verification, and sampling. Every evaluation run saves
                its configuration and raw outputs so anyone can reproduce the results.
              </>
            )}
          </p>
        </div>

        <Link
          href="/request"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-[var(--brand-cta)] px-6 font-sans text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[var(--brand-cta-hover)]"
        >
          {isTh ? "ส่งคำขอทดสอบไปป์ไลน์ →" : "Request a custom run →"}
        </Link>
      </div>
    </div>
  );
}
