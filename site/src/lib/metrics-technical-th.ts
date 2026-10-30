import type { MetricId, MetricSymbol } from "@/types/metrics";

interface TechnicalTh {
  /** Thai meanings for the formula's symbol legend. */
  symbols: MetricSymbol[];
  /** Thai implementation notes. */
  notes: string[];
}

/**
 * Thai layer for "Show the math". The TeX itself stays English on purpose
 * (KaTeX has no Thai glyphs for \text{}), but the legend and notes read Thai.
 */
export const TECHNICAL_DETAILS_TH: Record<MetricId, TechnicalTh> = {
  judge: {
    symbols: [
      { symbol: "v_i", meaning: "ได้ 1 ถ้า judge ว่าถูก ไม่ใช่ก็ 0" },
      { symbol: "K", meaning: "คำถามที่ตัดสินได้" },
      { symbol: "|K|", meaning: "จำนวนคำถามเหล่านั้น" },
    ],
    notes: [
      "KIMI-K3 ตัดสินที่ temperature 0 คำตอบเดิมจึงได้ผลเดิมทุกครั้ง",
      "คำตอบที่ judge อ่านผลไม่ออกจะถูกตัดออกจากตัวหาร ไม่ได้ให้ 0",
      "เฉลยเป็นแค่แนวทางให้ judge ไม่ใช่รูปแบบเดียวที่ยอมรับ",
    ],
  },

  em: {
    symbols: [
      { symbol: "N", meaning: "จำนวนคำถามในตัวอย่าง" },
      { symbol: "p_i", meaning: "คำตอบของโมเดล" },
      { symbol: "g_i^(r)", meaning: "เฉลยชุดที่ r" },
      {
        symbol: "norm()",
        meaning: "ตัวพิมพ์เล็กหมด ตัด a/an/the ลบเครื่องหมาย ASCII บีบช่องว่าง",
      },
      { symbol: "1[·]", meaning: "ได้ 1 เมื่อเงื่อนไขจริง ไม่ใช่ก็ 0" },
    ],
    notes: [
      "การจัดรูปแบบคือตัวพิมพ์เล็กทั้งหมด ตัด a/an/the ของภาษาอังกฤษ ลบเครื่องหมาย ASCII และบีบช่องว่าง",
      "ช่องว่างถูกบีบเหลือช่องเดียว ไม่ได้ลบออกทั้งหมด ขอบเขตคำไทยจึงยังมีผลต่อ EM",
      "ถ้าเฉลยมีหลายชุด เอาชุดที่ตรงที่สุดมานับข้อนั้น",
    ],
  },

  mth: {
    symbols: [
      { symbol: "norm_th()", meaning: "จัดรูปแบบแล้วลบช่องว่างทิ้งทั้งหมด" },
      { symbol: "⊆", meaning: "อยู่ภายใน" },
      { symbol: "g_i^(r)", meaning: "เฉลยชุดที่ r" },
      { symbol: "p_i", meaning: "คำตอบของโมเดล" },
    ],
    notes: [
      "วัดแบบอยู่ภายใน ไม่ใช่เทียบคำทับกัน: เฉลยหลังจัดรูปแบบต้องอยู่ครบในคำตอบ",
      "ผ่าน-ไม่ผ่านรายข้อ คลาดแค่คำเดียวก็ได้ 0 แม้คำอื่นจะตรงหมด",
      "เครื่องหมายไทยอย่าง ฯ ไม่ถูกลบออก เพราะไม่ใช่เครื่องหมาย ASCII",
    ],
  },

  precision: {
    symbols: [
      { symbol: "m_i", meaning: "หน่วยคำที่ตรงกัน" },
      { symbol: "|Ŷ_i|", meaning: "หน่วยคำที่โมเดลเขียน" },
      { symbol: "N", meaning: "จำนวนคำถามในตัวอย่าง" },
    ],
    notes: [
      "หน่วยคำมาจากการตัดคำด้วย PyThaiNLP (newmm) หลังจัดรูปแบบ ช่องว่างไม่ถูกนับ",
      "เทียบคำแบบนับซ้ำ (multiset): คำที่ซ้ำนับได้ไม่เกินจำนวนที่ปรากฏทั้งสองฝั่ง",
      "ให้คะแนนเฉลยแยกแต่ละชุด เอาชุดที่ดีที่สุด แล้วถัวเฉลี่ยทุกข้อ",
    ],
  },

  recall: {
    symbols: [
      { symbol: "m_i", meaning: "หน่วยคำที่ตรงกัน" },
      { symbol: "|Y_i|", meaning: "หน่วยคำในเฉลย" },
      { symbol: "N", meaning: "จำนวนคำถามในตัวอย่าง" },
    ],
    notes: [
      "ตัดคำและเทียบแบบเดียวกับ precision เพียงเปลี่ยนตัวหารเป็นเฉลย",
      "คำตอบสั้นที่ตกคำสำคัญจะเสีย recall แม้ทุกคำที่เขียนจะถูก",
      "ถัวเฉลี่ยรายข้อ คำตอบผิดข้อเดียวไม่ฉุดทั้งรัน",
    ],
  },

  f1: {
    symbols: [
      { symbol: "P_i", meaning: "precision ของข้อ i" },
      { symbol: "R_i", meaning: "recall ของข้อ i" },
      { symbol: "N", meaning: "จำนวนคำถามในตัวอย่าง" },
    ],
    notes: [
      "ค่าเฉลี่ยฮาร์มอนิกรายข้อ สูงได้ต่อเมื่อ precision และ recall สูงพร้อมกัน",
      "คำนวณ F1 รายข้อก่อนแล้วถัวเฉลี่ย ไม่ได้คิดจากค่าเฉลี่ยสองตัวอีกครั้ง",
      "ฝั่งใดฝั่งหนึ่งเป็น 0 เมื่อไหร่ F1 ได้ 0",
    ],
  },

  generation: {
    symbols: [
      { symbol: "t_start", meaning: "เริ่มจับเวลาเมื่อสั่งสร้างคำตอบ" },
      { symbol: "t_stop", meaning: "หยุดเมื่อคำตอบครบทุกข้อ" },
      { symbol: "T_gen", meaning: "เวลารวมทั้งตัวอย่าง" },
    ],
    notes: [
      "จับเวลาเฉพาะตอนสร้างคำตอบ การค้นหาและจัดอันดับเสร็จก่อนหน้านั้น",
      "นับรวมการประกอบพรอมต์ ทุกการเรียกโมเดล การเขียน checkpoint และการรันต่อ",
      "เป็นเวลาจริงบนเครื่องที่รัน: เทียบกันระหว่างรันได้ แต่เทียบกับนาฬิกาจับเวลาตรงไม่ได้",
    ],
  },
};
