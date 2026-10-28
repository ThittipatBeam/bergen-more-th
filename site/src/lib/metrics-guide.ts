import type { Language } from "@/hooks/use-language";

/** "Which score should I use?" cheat sheet. */
export interface WhichScoreRow {
  need: string;
  use: string;
  why: string;
}

export const WHICH_SCORE_ROWS_EN: WhichScoreRow[] = [
  {
    need: "One number to rank pipelines on",
    use: "Overall",
    why: "Combines all four correctness metrics, weighted toward the judge score.",
  },
  {
    need: "Check factual correctness",
    use: "Judge",
    why: "Evaluates meaning rather than surface phrasing.",
  },
  {
    need: "Verify answer key coverage",
    use: "Recall · F1",
    why: "Measures what share of reference words appeared in the answer.",
  },
  {
    need: "Penalize wordy responses",
    use: "Precision",
    why: "Extra words not present in the reference lower this score.",
  },
  {
    need: "Require exact text match",
    use: "EM",
    why: "Pass or fail after standard text normalization.",
  },
  {
    need: "Compare model latency",
    use: "Generation time",
    why: "Measures generator writing time only, excluding retrieval.",
  },
];

export const WHICH_SCORE_ROWS_TH: WhichScoreRow[] = [
  {
    need: "ต้องการตัวเลขเดียวสำหรับจัดอันดับ",
    use: "Overall",
    why: "รวมคะแนนความถูกต้อง 4 ด้านเข้าด้วยกัน โดยให้น้ำหนักกับ judge มากที่สุด",
  },
  {
    need: "ต้องการตรวจความถูกต้องของเนื้อหา",
    use: "Judge",
    why: "ตรวจจากความหมายของคำตอบ ไม่ยึดติดกับการสะกดคำหรือการเรียบเรียงใหม่",
  },
  {
    need: "ต้องการตรวจว่าตอบเนื้อหาเฉลยครบไหม",
    use: "Recall · F1",
    why: "วัดว่าคำตอบของโมเดลครอบคลุมคำในเฉลยมากน้อยเพียงใด",
  },
  {
    need: "ต้องการตรวจว่าโมเดลตอบคำเกินหรือไม่",
    use: "Precision",
    why: "คำที่โมเดลตอบเกินและไม่มีในเฉลยจะทำให้คะแนนลดลง",
  },
  {
    need: "ต้องการข้อความที่ตรงกับเฉลยทุกตัวอักษร",
    use: "EM",
    why: "ข้อความต้องตรงกับเฉลยทุกประการหลังปรับรูปแบบมาตรฐาน",
  },
  {
    need: "ต้องการดูความเร็วในการสร้างคำตอบ",
    use: "Generation time",
    why: "จับเวลาเฉพาะช่วงที่โมเดลเขียนคำตอบ ไม่รวมเวลาค้นหาเอกสาร",
  },
];

export function getWhichScoreRows(lang: Language = "EN"): WhichScoreRow[] {
  return lang === "TH" ? WHICH_SCORE_ROWS_TH : WHICH_SCORE_ROWS_EN;
}

export const WHICH_SCORE_ROWS = WHICH_SCORE_ROWS_EN;
