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
    why: "Blends all four correctness scores, weighted to the judge.",
  },
  {
    need: "Answers I can trust",
    use: "Judge",
    why: "Reads meaning, not spelling.",
  },
  {
    need: "Proof the source's words were used",
    use: "Recall · F1",
    why: "Measures how much of the answer key was covered.",
  },
  {
    need: "To catch waffle",
    use: "Precision",
    why: "Every extra word lowers it.",
  },
  {
    need: "An exact string match",
    use: "EM",
    why: "All or nothing, after a light cleanup.",
  },
  {
    need: "Speed",
    use: "Generation time",
    why: "Model writing time only.",
  },
];

export const WHICH_SCORE_ROWS_TH: WhichScoreRow[] = [
  {
    need: "ต้องการตัวเลขเดียวสำหรับจัดอันดับ",
    use: "Overall",
    why: "ถ่วงน้ำหนักรวม 4 มิติวัดความถูกต้อง โดยให้ความสำคัญกับ Judge สูงสุด",
  },
  {
    need: "ต้องการรู้ว่าคำตอบถูกต้องและไว้ใจได้ไหม",
    use: "Judge",
    why: "ตัดสินจากความหมายของเนื้อหา ไม่ยึดติดกับการสะกดหรือ Paraphrase",
  },
  {
    need: "ต้องการตรวจสอบว่าเนื้อหาเฉลยถูกครอบคลุมครบ",
    use: "Recall · F1",
    why: "วัดสัดส่วนคำตอบเฉลยที่โมเดลตอบได้ครอบคลุม",
  },
  {
    need: "ต้องการดักจับโมเดลที่ตอบเวิ่นเว้อหรือน้ำท่วมทุ่ง",
    use: "Precision",
    why: "ทุกคำที่ไม่จำเป็นที่โมเดลใส่เข้ามาจะทำให้คะแนนลดลง",
  },
  {
    need: "ต้องการข้อความที่ตรงกับเฉลยแบบ 100%",
    use: "EM",
    why: "ข้อความต้องตรงกันทุกประการ (วัดแบบผ่านหรือไม่ผ่าน)",
  },
  {
    need: "ต้องการความเร็วและต้นทุนต่ำในระบบจริง",
    use: "Generation time",
    why: "วัดเวลาสร้างคำตอบจริงของโมเดลเท่านั้น",
  },
];

export function getWhichScoreRows(lang: Language = "EN"): WhichScoreRow[] {
  return lang === "TH" ? WHICH_SCORE_ROWS_TH : WHICH_SCORE_ROWS_EN;
}

export const WHICH_SCORE_ROWS = WHICH_SCORE_ROWS_EN;
