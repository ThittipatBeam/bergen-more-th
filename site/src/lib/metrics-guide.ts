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
    why: "Combines Judge (80%) with Match TH (20%). The word-overlap metrics are diagnostics only.",
  },
  {
    need: "Check factual correctness",
    use: "Judge",
    why: "Evaluates meaning rather than surface phrasing.",
  },
  {
    need: "Verify answer key coverage",
    use: "Match TH · Recall",
    why: "Match TH decides 20% of the rank; Recall shows what share of key words appeared.",
  },
  {
    need: "Penalize wordy responses",
    use: "Precision",
    why: "Extra words lower this diagnostic, but they do not change the rank.",
  },
  {
    need: "Require exact text match",
    use: "EM",
    why: "Pass or fail after normalization; a diagnostic with no effect on rank.",
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
    why: "รวม Judge (80%) กับ Match TH (20%) ส่วน metric ด้านคำศัพท์ใช้ประกอบการตรวจสอบเท่านั้น",
  },
  {
    need: "ต้องการตรวจความถูกต้องของเนื้อหา",
    use: "Judge",
    why: "ตรวจจากความหมายของคำตอบ ไม่ยึดติดกับการสะกดคำหรือการเรียบเรียงใหม่",
  },
  {
    need: "ต้องการตรวจว่าตอบเนื้อหาเฉลยครบไหม",
    use: "Match TH · Recall",
    why: "Match TH มีน้ำหนัก 20% ของอันดับ ส่วน Recall แสดงว่าครอบคลุมคำในเฉลยมากแค่ไหน",
  },
  {
    need: "ต้องการตรวจว่าโมเดลตอบคำเกินหรือไม่",
    use: "Precision",
    why: "คำตอบที่ยาวเกินทำให้คะแนนนี้ลดลง แต่ไม่เปลี่ยนอันดับ",
  },
  {
    need: "ต้องการข้อความที่ตรงกับเฉลยทุกตัวอักษร",
    use: "EM",
    why: "ต้องตรงทุกตัวอักษรหลังปรับมาตรฐาน ใช้ประกอบการตรวจสอบ ไม่มีผลต่ออันดับ",
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
