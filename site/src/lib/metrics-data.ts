import { TECHNICAL_DETAILS } from "@/lib/metrics-technical";
import { TECHNICAL_DETAILS_TH } from "@/lib/metrics-technical-th";
import type { Language } from "@/hooks/use-language";
import type {
  MetricDefinition,
  MetricId,
  MetricTechnicalCopy,
} from "@/types/metrics";

const techOf = (
  id: MetricId,
  isTh: boolean,
  reading: string
): MetricTechnicalCopy => {
  const base = TECHNICAL_DETAILS[id];
  if (!isTh) return base;
  const th = TECHNICAL_DETAILS_TH[id];
  return {
    ...base,
    reading,
    formula: { tex: base.formula.tex, symbols: th.symbols },
    notes: th.notes,
  };
};

export function getMetrics(lang: Language = "EN"): Record<MetricId, MetricDefinition> {
  const isTh = lang === "TH";

  return {
    judge: {
      id: "judge",
      name: "Judge",
      icon: "gavel",
        family: "quality",
      direction: "higher",
      simple: {
        question: isTh ? "ถ้าคนอ่าน จะบอกว่าคำตอบนี้ถูกต้องไหม?" : "Would a reader say it's right?",
        explanation: isTh
          ? "โมเดลอีกตัวอ่านคำตอบ แล้วตอบสั้นๆ ว่าถูก (YES) หรือผิด (NO)"
          : "A second AI reads each answer and says yes or no.",
        example: isTh ? "ความหมายถูก แต่ใช้คำต่าง: ได้ 1" : "Right meaning, different spelling: 1",
      },
      technical: techOf(
        "judge",
        isTh,
        isTh ? "คะแนน 96 แปลว่า judge ตัดสินว่าถูก 96 ข้อจาก 100 ข้อ" : TECHNICAL_DETAILS.judge.reading
      ),
    },

    em: {
      id: "em",
      name: "Exact Match",
      icon: "match_case",
        family: "containment",
      direction: "higher",
      simple: {
        question: isTh ? "คำตอบตรงกับเฉลยทุกตัวอักษรหรือไม่?" : "Same words as the answer key?",
        explanation: isTh
          ? "จัดรูปแบบข้อความทั้งสองฝั่งให้เป็นมาตรฐานเดียวกัน แล้วต้องเหมือนกันเป๊ะ"
          : "Both sides are cleaned up, then must be identical.",
        example: isTh ? "ความหมายเหมือนกัน แต่สะกดต่าง: ได้ 0" : "Same meaning, different spelling: 0",
      },
      technical: techOf(
        "em",
        isTh,
        isTh ? "เป็นแบบผ่าน-ไม่ผ่าน ตอบถูกแต่เรียบเรียงคำใหม่ก็ได้ 0" : TECHNICAL_DETAILS.em.reading
      ),
    },

    mth: {
      id: "mth",
      name: "Match TH",
      icon: "select_check_box",
        family: "containment",
      direction: "higher",
      simple: {
        question: isTh ? "คำตอบมีข้อความเฉลยครบทุกคำหรือไม่?" : "Is the whole key inside the answer?",
        explanation: isTh
          ? "ไม่สนช่องว่าง ถ้าคำเฉลยขาดไปแม้แต่คำเดียว ได้ 0"
          : "Spaces ignored. One changed word means no.",
        example: isTh ? "คำในเฉลยตกหล่นไปหนึ่งคำ: ได้ 0" : "One changed word: 0",
      },
      technical: techOf(
        "mth",
        isTh,
        isTh ? "ผ่าน-ไม่ผ่านรายข้อ เฉลยต้องอยู่ครบในคำตอบถึงจะได้เต็ม" : TECHNICAL_DETAILS.mth.reading
      ),
    },

    precision: {
      id: "precision",
      name: "Precision",
      icon: "compress",
        family: "overlap",
      direction: "higher",
      simple: {
        question: isTh ? "โมเดลตอบคำเกินจากเฉลยหรือไม่?" : "Any extra words?",
        explanation: isTh
          ? "ยิ่งเขียนคำเกินที่ไม่มีในเฉลย คะแนนยิ่งตก"
          : "Every word the model adds lowers it.",
        example: isTh ? "ใช้ตรง 5 จาก 6 คำ: ได้ 83.3" : "5 of 6 words used: 83.3",
      },
      technical: techOf(
        "precision",
        isTh,
        isTh ? "ในคำตอบของโมเดล มีเท่าไหร่ที่เป็นคำจากเฉลย" : TECHNICAL_DETAILS.precision.reading
      ),
    },

    recall: {
      id: "recall",
      name: "Recall",
      icon: "done_all",
        family: "overlap",
      direction: "higher",
      simple: {
        question: isTh ? "โมเดลตอบตกหล่นคำสำคัญในเฉลยหรือไม่?" : "Any missing words?",
        explanation: isTh
          ? "คำไหนในเฉลยที่โมเดลตอบตกไป คะแนนก็หล่น"
          : "Every word the model drops lowers it.",
        example: isTh ? "ครอบคลุม 5 จาก 6 คำในเฉลย: ได้ 83.3" : "5 of 6 words covered: 83.3",
      },
      technical: techOf(
        "recall",
        isTh,
        isTh ? "คำในเฉลยถูกโมเดลตอบครอบคลุมแค่ไหน" : TECHNICAL_DETAILS.recall.reading
      ),
    },

    f1: {
      id: "f1",
      name: "F1",
      icon: "scale",
        family: "overlap",
      direction: "higher",
      simple: {
        question: isTh ? "ความสมดุลระหว่างตอบครบกับไม่ตอบเกิน" : "Extra and missing, in one number?",
        explanation: isTh
          ? "สูงได้ก็ต่อเมื่อตอบครบและกระชับพร้อมกัน"
          : "High only when both sides are high.",
        example: isTh ? "ทั้งสองฝั่งได้ 83.3: F1 83.3" : "Both 83.3: F1 83.3",
      },
      technical: techOf(
        "f1",
        isTh,
        isTh ? "ค่าเฉลี่ยฮาร์มอนิกของ Precision และ Recall" : TECHNICAL_DETAILS.f1.reading
      ),
    },

    generation: {
      id: "generation",
      name: isTh ? "Generation time" : "Generation time",
      icon: "timer",
        family: "speed",
      direction: "lower",
      simple: {
        question: isTh ? "เขียนคำตอบครบ 500 ข้อใช้เวลานานแค่ไหน?" : "How long to write all 500?",
        explanation: isTh
          ? "จับเวลาตอนโมเดลเขียนคำตอบอย่างเดียว ไม่รวมขั้นค้นหาและจัดอันดับ"
          : "Writing only. Search and reranking run before the clock starts.",
        example: isTh ? "เวลารวมทั้ง 500 คำถาม ไม่ใช่เวลาของข้อเดียว" : "Total for all 500 answers, not one answer.",
      },
      technical: techOf(
        "generation",
        isTh,
        isTh ? "เวลาทั้งหมดที่ generator ใช้เขียนคำตอบ 500 ข้อ (นาที:วินาที)" : TECHNICAL_DETAILS.generation.reading
      ),
    },
  };
}

export const METRICS = getMetrics("EN");

