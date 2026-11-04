"use client";

import { getMetrics } from "@/lib/metrics-data";
import {
  NITI_METRIC_ORDER,
  getNitiMetrics,
} from "@/lib/nitibench-metrics-data";
import type { MetricId } from "@/types/metrics";
import { MetricRow } from "./MetricRow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/hooks/use-language";
import { useDataset } from "@/hooks/use-dataset";
import { CARD, MEASURE_NOTE, SMALL } from "@/lib/design";

const METRIC_ORDER: MetricId[] = [
  "judge",
  "mth",
  "em",
  "precision",
  "recall",
  "f1",
  "generation",
];

/** All metrics side by side; formulas stay behind "Show the math". */
export function MetricTable() {
  const { language } = useLanguage();
  const { isNiti } = useDataset();
  const isTh = language === "TH";
  const wiki = getMetrics(language);
  const niti = getNitiMetrics(language);

  const columns = [
    isTh ? "Metric" : "Metric",
    isTh ? "ตอบคำถามอะไร" : "What it asks",
    isTh ? "วิธีคิดคะแนน" : "How it scores",
  ];

  return (
    <section
      aria-labelledby="metric-table-title"
      className={`flex flex-col gap-6 ${CARD}`}
    >
      <SectionHeading
        id="metric-table-title"
        kicker={isTh ? "ตารางอ้างอิง" : "Reference"}
        title={
          isNiti
            ? isTh ? "5 metric" : "5 metrics"
            : isTh ? "7 metric" : "7 metrics"
        }
        intro={
          isNiti
            ? isTh
              ? "Bar rubric เป็นตัวจัดอันดับ Citation F1 ตัดสินคะแนนที่เท่ากัน สามตัวหลังใช้ตรวจสอบ"
              : "The Bar rubric decides the rank and Citation F1 breaks ties. The other three are shown for inspection."
            : isTh
              ? "Judge และ Match TH ใช้คิดคะแนนรวม อีก 5 ตัวแสดงไว้ให้ตรวจสอบและไม่เปลี่ยนอันดับ"
              : "Judge and Match TH decide the overall score. The other five are shown for inspection and never move the rank."
        }
      />

      {/* Column headings exist only in the sm+ grid layout. */}
      <div
        aria-hidden="true"
        className="hidden border-b border-[var(--border-default)] pb-2 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-6 sm:px-6"
      >
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>

      <ol className="flex flex-col divide-y divide-[var(--border-default)]">
        {isNiti
          ? NITI_METRIC_ORDER.map((id) => (
              <li key={id}>
                <MetricRow metric={niti[id]} />
              </li>
            ))
          : METRIC_ORDER.map((id) => (
              <li key={id}>
                <MetricRow metric={wiki[id]} />
              </li>
            ))}
      </ol>

      <p className={`${SMALL} ${MEASURE_NOTE} text-[var(--text-muted)]`}>
        {isNiti
          ? isTh
            ? "EM/F1 แบบเทียบคำยังคำนวณอยู่เบื้องหลังแต่ไม่แสดงบนบอร์ดนี้ เพราะคำตอบกฎหมายถูกบันทึกเป็น JSON เชิงโครงสร้าง การเทียบคำไม่ได้บอกความถูกต้องของเนื้อหา"
            : "Lexical EM/F1 is still computed underneath but never shown on this board: legal answers are structured JSON, so word overlap says little about correctness."
          : isTh
            ? "Match TH, Precision, Recall และ F1 ตัดคำไทยด้วย PyThaiNLP ก่อนเทียบคำ ส่วน judge อ่านความหมาย และ exact match เทียบข้อความตรงๆ หลังจัดรูปแบบ"
            : "Match TH, Precision, Recall and F1 segment Thai words with PyThaiNLP before comparing. The judge reads meaning; exact match compares strings after normalization."}
      </p>
    </section>
  );
}
