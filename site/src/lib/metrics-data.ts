import { TECHNICAL_DETAILS } from "@/lib/metrics-technical";
import type { Language } from "@/hooks/use-language";
import type {
  MetricChapter,
  MetricDefinition,
  MetricId,
} from "@/types/metrics";

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
          ? "LLM อีกโมเดลหนึ่งอ่านคำตอบ แล้วตัดสินว่าถูก (YES) หรือผิด (NO)"
          : "A second AI reads each answer and says yes or no.",
        example: isTh ? "ความหมายถูก แต่ใช้คำต่าง → 1" : "Right meaning, different spelling → 1",
      },
      technical: {
        ...TECHNICAL_DETAILS.judge,
        reading: isTh
          ? "คะแนน 96 หมายความว่าใน 100 คำถาม Judge ตัดสินว่าถูกต้อง 96 ข้อ"
          : TECHNICAL_DETAILS.judge.reading,
      },
    },

    em: {
      id: "em",
      name: "Exact Match",
      icon: "match_case",
      family: "containment",
      direction: "higher",
      simple: {
        question: isTh ? "คำตอบตรงกับเฉลยแบบคำต่อคำหรือไม่?" : "Same words as the answer key?",
        explanation: isTh
          ? "ทำความสะอาดข้อความทั้งสองฝั่ง แล้วต้องเหมือนกันทุกประการ"
          : "Both sides are cleaned up, then must be identical.",
        example: isTh ? "ความหมายเหมือนกัน แต่สะกดต่าง → 0" : "Same meaning, different spelling → 0",
      },
      technical: {
        ...TECHNICAL_DETAILS.em,
        reading: isTh
          ? "วัดผลแบบผ่านหรือไม่ผ่าน หากตอบถูกแต่เรียบเรียงใหม่จะได้ 0"
          : TECHNICAL_DETAILS.em.reading,
      },
    },

    mth: {
      id: "mth",
      name: "Match TH",
      icon: "select_check_box",
      family: "containment",
      direction: "higher",
      simple: {
        question: isTh ? "คำตอบเฉลยทั้งหมดปรากฏในข้อความหรือไม่?" : "Is the whole key inside the answer?",
        explanation: isTh
          ? "ไม่สนใจช่องว่าง หากคำเฉลยหายไปแม้แต่คำเดียวจะได้ 0"
          : "Spaces ignored. One changed word means no.",
        example: isTh ? "คำเฉลยเปลี่ยนไปหนึ่งคำ → 0" : "One changed word → 0",
      },
      technical: {
        ...TECHNICAL_DETAILS.mth,
        reading: isTh
          ? "วัดผลแบบผ่านหรือไม่ผ่านต่อข้อ หากคำตอบเฉลยปรากฏครบในคำตอบจะได้เต็ม"
          : TECHNICAL_DETAILS.mth.reading,
      },
    },

    precision: {
      id: "precision",
      name: "Precision",
      icon: "compress",
      family: "overlap",
      direction: "higher",
      simple: {
        question: isTh ? "มีคำที่ไม่จำเป็นหรือตอบเวิ่นเว้อหรือไม่?" : "Any extra words?",
        explanation: isTh
          ? "ทุกคำที่โมเดลตอบเพิ่มมาแล้วไม่มีในเฉลย จะทำให้คะแนนลดลง"
          : "Every word the model adds lowers it.",
        example: isTh ? "ใช้ตรง 5 จาก 6 คำ → 83.3" : "5 of 6 words used → 83.3",
      },
      technical: {
        ...TECHNICAL_DETAILS.precision,
        reading: isTh
          ? "สัดส่วนคำภาษาไทยในคำตอบของโมเดลที่ปรากฏอยู่ในเฉลย"
          : TECHNICAL_DETAILS.precision.reading,
      },
    },

    recall: {
      id: "recall",
      name: "Recall",
      icon: "done_all",
      family: "overlap",
      direction: "higher",
      simple: {
        question: isTh ? "มีเนื้อหาในเฉลยที่ตอบตกหล่นหรือไม่?" : "Any missing words?",
        explanation: isTh
          ? "ทุกคำในเฉลยที่โมเดลไม่ได้ตอบ จะทำให้คะแนนลดลง"
          : "Every word the model drops lowers it.",
        example: isTh ? "ครอบคลุม 5 จาก 6 คำในเฉลย → 83.3" : "5 of 6 words covered → 83.3",
      },
      technical: {
        ...TECHNICAL_DETAILS.recall,
        reading: isTh
          ? "สัดส่วนคำในเฉลยที่โมเดลสามารถตอบได้ครอบคลุม"
          : TECHNICAL_DETAILS.recall.reading,
      },
    },

    f1: {
      id: "f1",
      name: "F1",
      icon: "scale",
      family: "overlap",
      direction: "higher",
      simple: {
        question: isTh ? "คะแนนรวมที่ชั่งน้ำหนักระหว่างตอบเกินกับตอบตกหล่น?" : "Extra and missing, in one number?",
        explanation: isTh
          ? "คะแนนจะสูงก็ต่อเมื่อทั้ง Precision และ Recall สูงทั้งคู่"
          : "High only when both sides are high.",
        example: isTh ? "ทั้งสองฝั่งได้ 83.3 → F1 83.3" : "Both 83.3 → F1 83.3",
      },
      technical: {
        ...TECHNICAL_DETAILS.f1,
        reading: isTh
          ? "ค่าเฉลี่ยฮาร์มอนิกของ Precision และ Recall ภาษาไทย"
          : TECHNICAL_DETAILS.f1.reading,
      },
    },

    generation: {
      id: "generation",
      name: isTh ? "Generation time" : "Generation time",
      icon: "timer",
      family: "speed",
      direction: "lower",
      simple: {
        question: isTh ? "ใช้เวลาสร้างคำตอบครบ 500 ข้อนานเท่าใด?" : "How long to write all 500?",
        explanation: isTh
          ? "จับเวลาเฉพาะช่วงโมเดลเขียน — ไม่รวมขั้นตอนค้นคืนและ Rerank"
          : "Writing only — search and ranking ran before.",
        example: isTh ? "เวลารวมทั้ง 500 คำถาม ไม่ใช่เวลาของข้อเดียว" : "Total for all 500 answers, not one answer.",
      },
      technical: {
        ...TECHNICAL_DETAILS.generation,
        reading: isTh
          ? "เวลาที่โมเดล Generator ใช้ในการสร้างคำตอบทั้งหมด 500 ข้อ (นาที:วินาที)"
          : TECHNICAL_DETAILS.generation.reading,
      },
    },
  };
}

export const METRICS = getMetrics("EN");

export function getMetricChapters(lang: Language = "EN"): MetricChapter[] {
  const isTh = lang === "TH";

  return [
    {
      id: "is-it-right",
      number: "01",
      title: isTh ? "1. โมเดลตอบถูกหรือไม่?" : "Is it right?",
      icon: "fact_check",
      intro: isTh
        ? "การประเมินความถูกต้อง 3 รูปแบบ ตั้งแต่การตัดสินของ LLM Judge ไปจนถึงข้อความที่ตรงกัน 100%"
        : "Three tests of correctness, from a reader's judgement to an exact string.",
      payoff: isTh
        ? "ความหมายตรงกันแต่สะกดต่าง: Judge ให้ 1 แต่ EM และ Match TH ให้ 0"
        : "Same meaning, different spelling: the judge says yes, EM and Match TH say no.",
      family: "quality",
      metrics: ["judge", "em", "mth"],
    },
    {
      id: "word-overlap",
      number: "02",
      title: isTh ? "2. คำตอบตรงกันกี่คำ (Word Overlap)?" : "How close are the words?",
      icon: "compare_arrows",
      intro: isTh
        ? "ภาษาไทยเขียนติดกันโดยไม่มีช่องว่าง จึงต้องตัดคำด้วย PyThaiNLP ก่อนวัดผล"
        : "Thai has no spaces, so answers are split into word pieces first.",
      payoff: isTh
        ? "Match TH ได้ 0 แต่ F1 ได้ 83.3 — การตอบถูกบางส่วนยังคงได้รับคะแนน"
        : "Match TH says 0, yet F1 says 83.3 — partial word matches still count.",
      family: "overlap",
      metrics: ["precision", "recall", "f1"],
    },
    {
      id: "speed",
      number: "03",
      title: isTh ? "3. โมเดลสร้างคำตอบเร็วแค่ไหน?" : "How fast?",
      icon: "speed",
      intro: isTh
        ? "จับเวลาเฉพาะช่วงที่โมเดลสร้างคำตอบ (Generation time)"
        : "One stopwatch: how long did the model spend writing?",
      payoff: isTh
        ? "ความเร็วจะเปรียบเทียบได้อย่างเที่ยงธรรมเมื่อวัดเฉพาะเวลาสร้างคำตอบของโมเดล"
        : "Speed only compares when you know what the clock excludes.",
      family: "speed",
      metrics: ["generation"],
    },
  ];
}

export const METRIC_CHAPTERS = getMetricChapters("EN");
