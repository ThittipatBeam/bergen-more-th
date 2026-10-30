"use client";

import Link from "next/link";
import { QUALITY_WEIGHTS } from "@/lib/benchmark-data";
import { FAMILY_COLORS } from "@/lib/metrics-styles";
import { useLanguage } from "@/hooks/use-language";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CARD, MEASURE_BODY, SMALL } from "@/lib/design";

/** The overall score as one stacked bar: weights you can see. */
export function MetricsOverallScore() {
  const { language } = useLanguage();
  const isTh = language === "TH";

  const segments = [
    {
      key: "judgePct" as const,
      metric: "Judge",
      color: FAMILY_COLORS.quality.fg,
      why: isTh
        ? "ตรวจว่าคำตอบถูกต้องตามความหมาย แม้เขียนด้วยคำอื่น"
        : "checks that the answer is correct, even in different words",
    },
    {
      key: "mTh" as const,
      metric: "Match TH",
      color: FAMILY_COLORS.containment.fg,
      why: isTh
        ? "ตรวจว่าข้อความเฉลยอยู่ครบในคำตอบ"
        : "checks the whole gold answer appears in the text",
    },
  ];

  return (
    <section
      id="overall-score"
      aria-labelledby="overall-score-title"
      className={`flex scroll-mt-28 flex-col gap-6 ${CARD}`}
    >
      <SectionHeading
        id="overall-score-title"
        kicker={isTh ? "คะแนนรวม Overall Score" : "Overall score"}
        title={isTh ? "วิธีคำนวณคะแนนรวม" : "How we combine scores"}
        intro={
          isTh
            ? "อันดับบนตารางมาจากคะแนนรวมตัวเดียว: 80% Judge และ 20% Match TH ส่วน F1, Precision, Recall และ Exact Match เป็นตัวชี้วัดประกอบที่ไม่เปลี่ยนอันดับ"
            : "The leaderboard ranks on one number: 80% Judge and 20% Match TH. F1, Precision, Recall and Exact Match stay as diagnostics and never move the rank."
        }
      />

      <p className="rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] px-4 py-3 font-mono text-sm leading-relaxed text-[var(--text-primary)]">
        Overall = 0.80·Judge + 0.20·Match TH
      </p>

      <figure className="flex flex-col gap-4">
        <div
          role="img"
          aria-label={isTh ? "แถบน้ำหนักคะแนนรวม: Judge 80%, Match TH 20%" : "Bar showing weights: Judge 80%, Match TH 20%"}
          className="flex h-5 w-full overflow-hidden rounded-full border border-[var(--border-default)]"
        >
          {segments.map((segment, index) => (
            <div
              key={segment.key}
              aria-hidden="true"
              className={index > 0 ? "border-l-2 border-[var(--background-primary)]" : undefined}
              style={{
                width: `${QUALITY_WEIGHTS[segment.key] * 100}%`,
                backgroundColor: segment.color,
              }}
            />
          ))}
        </div>
        <figcaption className="sr-only">
          {isTh ? "สัดส่วนน้ำหนักคะแนนรวม" : "Share of the overall score"}
        </figcaption>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          {segments.map((segment) => (
            <li
              key={segment.key}
              className="flex items-baseline gap-2 font-sans text-sm leading-relaxed"
            >
              <span
                aria-hidden="true"
                className="size-2 shrink-0 translate-y-[-1px] self-center rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="font-semibold text-[var(--text-primary)]">
                {segment.metric} {Math.round(QUALITY_WEIGHTS[segment.key] * 100)}%
              </span>
              <span className="text-[var(--text-secondary)]">
                — {segment.why}
              </span>
            </li>
          ))}
        </ul>
      </figure>

      <p className={`${SMALL} ${MEASURE_BODY} border-l-2 border-[var(--perf-text)] pl-4 text-[var(--text-secondary)]`}>
        {isTh
          ? "เวลาสร้างคำตอบไม่อยู่ในสูตรนี้ เปลี่ยนอันดับไม่ได้ แยกไว้เป็นคอลัมน์ของตัวเอง เผื่ออยากจัดเรียงตามความเร็ว"
          : "Generation time never enters this formula and cannot change the ranking. It stays in its own column, for sorting by speed."}
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
