import type { StoryScore } from "@/types/metrics";

/**
 * The NitiBench worked example: a real benchmark case (Dika 725/2529, the
 * installment-sale ruling from NitiBench+) with one sub-question. The
 * question and the court's call come from the dataset; the model answer and
 * the rubric grade below are illustrative, not a logged prediction.
 */
export const NITI_WORKED_EXAMPLE = {
  question: {
    th: "ข้อตกลงที่ให้ผู้ซื้อยังรับผิดแม้รถยนต์สูญหายก่อนชำระราคาครบ มีผลบังคับหรือไม่? (ฎีกาที่ 725/2529)",
    en: "A car sold by installments was stolen before the price was settled; does the clause that still binds the buyer hold? (Dika ruling 725/2529)",
  },
  reference: {
    th: "บทบัญญัติดังกล่าวมิใช่กฎหมายอันเกี่ยวด้วยความสงบเรียบร้อยหรือศีลธรรมอันดีของประชาชน สัญญาข้อ 4 จึงไม่ตกเป็นโมฆะ (ป.พ.ฎ. มาตรา 372 ฉบับ พ.ศ. 2521)",
    en: "The clause breaks no public-order rule, so clause 4 is not void (Civil and Commercial Code, section 372, 1978 version).",
  },
  model: {
    th: "verdict: มีผลบังคับ สัญญาไม่ตกเป็นโมฆะ · เหตุผล: ข้อตกลงไม่ขัดความสงบเรียบร้อยหรือศีลธรรมอันดี · อ้าง: ป.พ.ฎ. มาตรา 372 ฉบับ พ.ศ. 2521",
    en: "verdict: the clause holds · reasoning: no public-order or good-morals conflict · cite: C.C.C. section 372, 1978 version",
  },
} as const;

/** Verdict strip under the example. */
export const NITI_STORY_SCORES: StoryScore[] = [
  { id: "rubric", label: "Bar (0–10)", value: "8", verdict: true },
  { id: "citationF1", label: "Citation F1", value: "100%", verdict: true },
  { id: "recallAtK", label: "Recall@k", value: "1/1", verdict: true },
  { id: "pAt1", label: "P@1", value: "1", verdict: true },
  { id: "hallucinated", label: "Halluc.", value: "0", verdict: true },
];
