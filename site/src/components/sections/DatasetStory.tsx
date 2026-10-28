"use client";

import { HuggingFace } from "@lobehub/icons";
import {
  DATASET_SIZE,
  getDatasetResult,
  getDatasetSteps,
  getSampleReasons,
} from "@/lib/methodology-data";
import { useLanguage } from "@/hooks/use-language";

const format = (value: number) => value.toLocaleString("en-US");

/** How the question bank is built, step by step, then why a run uses 500 of it. */
export function DatasetStory() {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const steps = getDatasetSteps(language);
  const reasons = getSampleReasons(language);
  const resultText = getDatasetResult(language);

  const usedShare = (DATASET_SIZE.perRun / DATASET_SIZE.bank) * 100;
  const lastStep = steps.length - 1;

  return (
    <div className="flex flex-col gap-10">
      <ol
        aria-label={isTh ? "ขั้นตอนการสร้างชุดคำถาม Benchmark" : "How the question bank is built"}
        className="flex flex-col"
      >
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-4 pb-12 last:pb-0 sm:gap-6"
          >
            {index < lastStep && (
              <span
                aria-hidden="true"
                className="absolute top-10 bottom-0 left-[1.125rem] w-px -translate-x-1/2 bg-[var(--border-default)] sm:top-12 sm:left-[1.375rem]"
              />
            )}
            <span className="relative z-10 grid size-9 place-items-center rounded-full bg-[var(--surface-brand)] font-mono text-sm font-bold text-[var(--brand-text)] sm:size-11">
              {index + 1}
            </span>

            <div className="flex min-w-0 flex-col gap-2.5">
              <h3 className="font-sans text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl">
                {step.title}
              </h3>
              <p className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
                {step.body}
              </p>

              {step.source && (
                <a
                  href={step.source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] w-fit items-center gap-2 font-sans text-sm font-semibold text-[var(--brand-text)] underline-offset-2 transition-colors hover:text-[var(--brand-cta-hover)] hover:underline"
                >
                  <span aria-hidden="true" className="inline-flex shrink-0 items-center">
                    <HuggingFace.Color size={16} />
                  </span>
                  {step.source.label}
                  <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}

              <span className="font-mono text-xs leading-relaxed text-[var(--text-muted)]">
                {step.meta}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <p className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">
          {isTh ? "ผลลัพธ์: " : "Result: "}
        </span>
        {resultText}
      </p>

      <section
        aria-labelledby="bank-and-run-title"
        className="flex flex-col gap-8 rounded-3xl border border-[var(--border-default)] bg-[var(--surface-brand)] p-6 sm:p-8"
      >
        <header className="flex flex-col gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
            {isTh ? "คลังข้อสอบและขนาดกลุ่มตัวอย่าง" : "Question bank and sample size"}
          </span>
          <h3
            id="bank-and-run-title"
            className="font-sans text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          >
            {isTh
              ? `มีคำถามในคลัง ${format(DATASET_SIZE.bank)} ข้อ, ใช้ ${format(DATASET_SIZE.perRun)} ข้อต่อหนึ่งรัน`
              : `${format(DATASET_SIZE.bank)} questions in bank, ${format(DATASET_SIZE.perRun)} used per run`}
          </h3>
          <p className="max-w-[58ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
            {isTh
              ? `การทดสอบทุกไปป์ไลน์บนคำถามทั้งหมด ${format(DATASET_SIZE.bank)} ข้อต้องใช้เวลาและทรัพยากรคำนวณสูง ตารางลีดเดอร์บอร์ดจึงใช้กลุ่มตัวอย่างคงที่ขนาด ${format(DATASET_SIZE.perRun)} ข้อสำหรับการวัดผลมาตรฐาน`
              : `Running every pipeline across all ${format(DATASET_SIZE.bank)} questions would require significant compute time and cost. The leaderboard uses a fixed sample of ${format(DATASET_SIZE.perRun)} questions for standard comparisons.`}
          </p>
        </header>

        <dl className="grid grid-cols-3 gap-4 border-t border-[var(--border-default)] pt-6 sm:gap-8">
          <div className="flex flex-col gap-1">
            <dt className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              {isTh ? "ในคลัง" : "In bank"}
            </dt>
            <dd className="font-mono text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              {format(DATASET_SIZE.bank)}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              {isTh ? "ใช้ต่อรัน" : "Per run"}
            </dt>
            <dd className="font-mono text-2xl font-bold text-[var(--brand-text)] sm:text-3xl">
              {format(DATASET_SIZE.perRun)}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              {isTh ? "สัดส่วนที่ใช้" : "Share used"}
            </dt>
            <dd className="font-mono text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              {usedShare.toFixed(1)}%
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2">
          <div
            role="img"
            aria-label={
              isTh
                ? `แต่ละรันใช้ ${format(DATASET_SIZE.perRun)} จาก ${format(DATASET_SIZE.bank)} คำถาม หรือประมาณ ${usedShare.toFixed(1)} เปอร์เซ็นต์`
                : `Each run uses ${format(DATASET_SIZE.perRun)} of ${format(DATASET_SIZE.bank)} questions, about ${usedShare.toFixed(1)} percent`
            }
            className="h-3 w-full overflow-hidden rounded-full bg-[var(--background-primary)]"
          >
            <div
              className="h-full rounded-full bg-[var(--brand-text)]"
              style={{ width: `${usedShare}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-xs text-[var(--text-muted)]">
            <span>{isTh ? `ใช้ ${format(DATASET_SIZE.perRun)} ข้อ` : `${format(DATASET_SIZE.perRun)} used`}</span>
            <span>{isTh ? `ทั้งหมด ${format(DATASET_SIZE.bank)} ข้อ` : `${format(DATASET_SIZE.bank)} in bank`}</span>
          </div>
        </div>

        <ul className="grid gap-6 border-t border-[var(--border-default)] pt-6 sm:grid-cols-3 sm:gap-8">
          {reasons.map((reason) => (
            <li key={reason.title} className="flex flex-col gap-1.5">
              <p className="font-sans text-base font-semibold leading-snug text-[var(--text-primary)]">
                {reason.title}
              </p>
              <p className="font-sans text-base leading-relaxed text-[var(--text-secondary)]">
                {reason.body}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
