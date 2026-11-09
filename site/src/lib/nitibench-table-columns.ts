import type { NitiMetricColumnKey } from "@/types/benchmark";
import type { ColumnFilterOption } from "@/components/ui/ColumnFilter";

export interface NitiTableColumn extends ColumnFilterOption<NitiMetricColumnKey> {
  align: "left" | "right" | "center";
  helpEn: string;
  helpTh: string;
}

/** Shared header, sorting, and column-picker definitions for the legal board. */
export const NITI_TABLE_COLUMNS: readonly NitiTableColumn[] = [
  {
    key: "retriever", labelEn: "Embedding", labelTh: "Embedding", category: "pipeline", align: "left",
    helpEn: "Embedding: dense statute-retrieval model.",
    helpTh: "Embedding: โมเดล dense retrieval สำหรับค้นหามาตรา",
  },
  {
    key: "reranker", labelEn: "Reranker", labelTh: "Reranker", category: "pipeline", align: "left",
    helpEn: "Reranker: optional second-pass model.",
    helpTh: "Reranker: โมเดลจัดอันดับซ้ำรอบสอง (ไม่บังคับ)",
  },
  {
    key: "rubricBar", labelEn: "Bar (0–10)", labelTh: "Bar (0–10)", category: "metric", align: "right",
    helpEn: "Bar rubric: official 8-tier score from 0 to 10. Determines rank; Citation F1 breaks displayed ties.",
    helpTh: "Bar rubric: คะแนนทางการ 8 ระดับ เต็ม 10 ใช้จัดอันดับ และ Citation F1 ตัดสินเมื่อคะแนนที่แสดงเท่ากัน",
  },
  {
    key: "citationF1", labelEn: "Citation F1", labelTh: "Citation F1", category: "metric", align: "center",
    helpEn: "Citation F1: statute citation precision and recall combined; breaks displayed Bar-score ties.",
    helpTh: "Citation F1: ค่ารวม precision และ recall ของการอ้างมาตรา ใช้ตัดสินเมื่อคะแนน Bar ที่แสดงเท่ากัน",
  },
  {
    key: "recallAtK", labelEn: "Recall@k", labelTh: "Recall@k", category: "metric", align: "center",
    helpEn: "Recall@k: share of court-cited statutes found in the top-k retrieval results.",
    helpTh: "Recall@k: สัดส่วนมาตราที่ศาลอ้างซึ่งพบในผล retrieval อันดับ k แรก",
  },
  {
    key: "pAt1", labelEn: "P@1", labelTh: "P@1", category: "metric", align: "center",
    helpEn: "P@1: percentage of questions with a court-cited statute at rank one.",
    helpTh: "P@1: สัดส่วนคำถามที่มีมาตราตามเฉลยอยู่ในอันดับแรก",
  },
  {
    key: "hallucinated", labelEn: "Halluc.", labelTh: "อ้างเพี้ยน", category: "metric", align: "center",
    helpEn: "Hallucinated citations: raw count of citations absent from the verifiable corpus; lower is better.",
    helpTh: "การอ้างเพี้ยน: จำนวนการอ้างที่ไม่มีในคลังที่ตรวจสอบได้ ยิ่งต่ำยิ่งดี",
  },
  {
    key: "nCases", labelEn: "Cases", labelTh: "คดี", category: "metric", align: "center",
    helpEn: "Cases: number of cases judged. Only complete 498-case runs appear on this board.",
    helpTh: "คดี: จำนวนคดีที่ judge ประเมิน บอร์ดนี้แสดงเฉพาะรันเต็ม 498 คดี",
  },
  {
    key: "genSeconds", labelEn: "Gen time (min:sec)", labelTh: "เวลาสร้าง (นาที:วินาที)", category: "metric", align: "right",
    helpEn: "Generation time: answer-writing time across all 498 cases, excluding retrieval and grading.",
    helpTh: "เวลาสร้างคำตอบ: เวลาเขียนคำตอบทั้ง 498 คดี ไม่รวมการค้นหาและการเกรด",
  },
  {
    key: "runDate", labelEn: "Date", labelTh: "วันที่", category: "metric", align: "right",
    helpEn: "Run date: when this evaluation was recorded.",
    helpTh: "วันที่รัน: วันที่บันทึกผลการประเมินนี้",
  },
];
