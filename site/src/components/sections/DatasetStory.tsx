"use client";

import { useRef } from "react";
import { HuggingFace } from "@lobehub/icons";
import {
  DATASET_SIZE,
  getDatasetResult,
  getDatasetStrip,
} from "@/lib/methodology-data";
import { useLanguage } from "@/hooks/use-language";
import { useStepTracker } from "@/hooks/use-step-tracker";
import { BODY, H3, MEASURE_BODY, MEASURE_NOTE, SMALL } from "@/lib/design";

const format = (value: number) => value.toLocaleString("en-US");

/** Question-bank construction as a scrollable vertical timeline with a progress line. */
export function DatasetStory() {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const steps = getDatasetStrip(language);
  const trackRef = useRef<HTMLOListElement>(null);
  const { active, fill } = useStepTracker(trackRef);

  const stats = [
    {
      label: isTh ? "คำถามในคลัง" : "In the bank",
      value: format(DATASET_SIZE.bank),
    },
    {
      label: isTh ? "ข้อต่อหนึ่งรัน" : "Per run",
      value: format(DATASET_SIZE.perRun),
    },
    {
      label: isTh ? "context ที่ต้องค้น" : "Passages searched",
      value: format(DATASET_SIZE.passages),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ol
        ref={trackRef}
        aria-label={isTh ? "ขั้นตอนการสร้างคลังคำถาม" : "How the question bank is built"}
        className="relative flex flex-col"
      >
        {/* Track + scroll progress fill */}
        <span
          aria-hidden="true"
          className="absolute top-5 bottom-10 left-[15px] w-0.5 rounded-full bg-[var(--border-default)]"
        />
        <span
          aria-hidden="true"
          style={{ height: fill }}
          className="absolute top-5 left-[15px] w-0.5 rounded-full bg-[var(--brand-text)] transition-[height] duration-200 ease-out motion-reduce:transition-none"
        />

        {steps.map((step, index) => {
          const passed = index <= active;
          return (
            <li
              key={step.title}
              data-step
              aria-current={index === active ? "step" : undefined}
              className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-4 pb-10 last:pb-0"
            >
              {/* Node */}
              <span className="flex justify-center pt-1.5">
                <span
                  aria-hidden="true"
                  className={`relative z-10 size-3.5 rounded-full border-2 transition-all duration-300 motion-reduce:transition-none ${
                    index === active
                      ? "scale-125 border-[var(--brand-text)] bg-[var(--brand-text)] shadow-[0_0_0_5px_var(--surface-brand)]"
                      : passed
                        ? "border-[var(--brand-text)] bg-[var(--brand-text)]"
                        : "border-[var(--border-default)] bg-[var(--background-primary)]"
                  }`}
                />
              </span>

              {/* Step content */}
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3
                    className={`${H3} transition-colors duration-300 motion-reduce:transition-none ${
                      passed ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                    }`}
                  >
                    <span className="mr-2 font-mono text-sm text-[var(--brand-text)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {step.title}
                  </h3>
                  <span className="rounded-full border border-[var(--border-default)] bg-[var(--background-subtle)] px-3 py-1 font-mono text-xs text-[var(--text-secondary)]">
                    {step.meta}
                  </span>
                </div>
                <p
                  className={`${BODY} ${MEASURE_BODY} transition-colors duration-300 motion-reduce:transition-none ${
                    passed ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {step.line}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <section
        aria-labelledby="bank-and-run-title"
        className="flex flex-col gap-5 rounded-3xl border border-[var(--border-default)] bg-[var(--surface-brand)] p-6 sm:p-8"
      >
        <h3 id="bank-and-run-title" className="sr-only">
          {isTh ? "ขนาดคลังคำถามและข้อมูลการรัน" : "Question bank size and run data"}
        </h3>

        <dl className="grid grid-cols-3 gap-4 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <dt className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                {stat.label}
              </dt>
              <dd className="font-mono text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className={`${SMALL} ${MEASURE_NOTE} border-t border-[var(--border-default)] pt-4 text-[var(--text-secondary)]`}>
          {getDatasetResult(language)}
        </p>

        <a
          href="https://huggingface.co/datasets/pythainlp/thai-wiki-dataset-v4"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] w-fit items-center gap-2 font-sans text-sm font-semibold text-[var(--brand-text)] underline-offset-2 transition-colors hover:text-[var(--brand-cta-hover)] hover:underline"
        >
          <span aria-hidden="true" className="inline-flex shrink-0 items-center">
            <HuggingFace.Color size={16} />
          </span>
          {isTh
            ? "ต้นทาง: thai-wiki-dataset-v4 · CC BY-SA 3.0"
            : "Source: thai-wiki-dataset-v4 · CC BY-SA 3.0"}
          <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </section>
    </div>
  );
}
