import type { MetricTechnicalCopy, NitiMetricId } from "@/types/metrics";

export const NITI_TECHNICAL_EN: Record<NitiMetricId, MetricTechnicalCopy> = {
  rubric: {
    reading: "6.33 means judged cases averaged 6.33 out of 10.",
    key: "niti_rubric_bar_standard (0-10)",
    formula: {
      tex: String.raw`\mathrm{Bar} = \frac{1}{N} \sum_{c=1}^{N} s_c`,
      symbols: [
        { symbol: "s_c", meaning: "rubric score of one case, 0 to 10" },
        { symbol: "N", meaning: "cases with a parsed grade" },
      ],
    },
    notes: [
      "The prompt is the official Thai Bar Council exam rubric, eight tiers; a wrong verdict caps the score at 4.",
      "KIMI-K3 grades through our harness at temperature 0; that is not the dataset's own judge.",
      "Repeating a run with identical retrieval moves the score about 0.4 to 0.5 points.",
    ],
  },
  citationF1: {
    reading: "42.0% of the bundled citations match the court's statute and version.",
    key: "niti_citation_f1 (micro, 0-100)",
    formula: {
      tex: String.raw`\mathrm{F1} = \frac{2PR}{P + R}`,
      symbols: [
        { symbol: "P", meaning: "share of the model's citations that are right" },
        { symbol: "R", meaning: "share of the court's citations the model found" },
      ],
    },
    notes: [
      "A match requires the right section and the version in force on the decision date.",
      "Parametric runs get the fuzzy variant: citings close to the right version still count.",
      "Citations to statutes that are not in the corpus land in the hallucination counter instead.",
    ],
  },
  recallAtK: {
    reading: "37.1% of the court's statutes appear somewhere in the top k.",
    key: "ranking_metrics recall_* (0-100)",
    formula: {
      tex: String.raw`\mathrm{Recall@}k = \frac{|\,D_{\mathrm{gold}} \cap D_{\mathrm{top}}\,|}{|\,D_{\mathrm{gold}}\,|}`,
      symbols: [
        { symbol: "D_gold", meaning: "statutes the court actually cited" },
        { symbol: "D_top", meaning: "statutes retrieval returned in the top k" },
      ],
    },
    notes: [
      "Counting is any-hit: finding the right section in any version scores, and section-exact counting is nearly identical on this corpus.",
      "The pool holds only the 3,253 gold statute rows; the full corpus is roughly 105k sections, so these numbers are easier than the official setup.",
    ],
  },
  pAt1: {
    reading: "36.0% of questions put a court-cited statute in the very first rank.",
    key: "ranking_metrics P_1 (0-100)",
    formula: {
      tex: String.raw`\mathrm{P@1} = \frac{100}{N} \sum_{i=1}^{N} \mathbf{1}\!\left[d_{i,1} \in D_{\mathrm{gold},i}\right]`,
      symbols: [
        { symbol: "d_i,1", meaning: "the first-ranked statute for question i" },
        { symbol: "1[·]", meaning: "1 when the hit is a gold statute, 0 otherwise" },
      ],
    },
    notes: [
      "P@1 punishes weak reranking: a correct statute at rank two or lower does not count.",
      "With several gold statutes per question, any one of them in first place scores.",
    ],
  },
  hallucinated: {
    reading: "A count of cited statutes that do not exist in the corpus at all.",
    key: "niti_citation_hallucinated (raw count)",
    formula: {
      tex: String.raw`\mathrm{Halluc.} = |\{c : c \notin \mathrm{corpus}\}|`,
      symbols: [
        { symbol: "c", meaning: "one citation the model emitted" },
        { symbol: "corpus", meaning: "the 3,253 statute versions we can verify" },
      ],
    },
    notes: [
      "A citation the law never contained is worse than a wrong version: keep this at zero.",
      "References to statutes the corpus never carried sit here, not in Citation F1.",
    ],
  },
};

export const NITI_TECHNICAL_TH: Record<
  NitiMetricId,
  { reading: string; symbols: { symbol: string; meaning: string }[]; notes: string[] }
> = {
  rubric: {
    reading: "6.33 แปลว่าเฉลี่ยทุกคดีที่ผ่านการเกรดได้ 6.33 จากเต็ม 10",
    symbols: [
      { symbol: "s_c", meaning: "คะแนน rubric ของคดีหนึ่ง ๆ เต็ม 10" },
      { symbol: "N", meaning: "จำนวนคดีที่ judge เกรดได้" },
    ],
    notes: [
      "prompt ใช้ rubric สอบวิชาชีพทนายความของทนายสภา 8 ระดับ ถ้าตอบผิดคำพิพากษา คะแนนสูงสุดคือ 4",
      "KIMI-K3 เกรดผ่าน harness เราด้วย temperature 0 ซึ่งไม่ใช่ judge ทางการของชุดข้อมูล",
      "รันเดิมซ้ำกับ retrieval เดียวกัน คะแนนแกว่งประมาณ 0.4 ถึง 0.5 คะแนน",
    ],
  },
  citationF1: {
    reading: "42.0% ของการอ้างทั้งหมดตรงทั้งมาตราและฉบับที่ศาลใช้",
    symbols: [
      { symbol: "P", meaning: "สัดส่วนอ้างของโมเดลที่ถูก" },
      { symbol: "R", meaning: "สัดส่วนมาตราของศาลที่โมเดลหยิบมาได้" },
    ],
    notes: [
      "นับว่าตรงก็ต่อเมื่อถูกทั้งเลขมาตราและฉบับที่มีผลใช้บังคับ ณ วันพิพากษา",
      "รันแบบ parametric ใช้ variant fuzzy คืออ้างใกล้ฉบับที่ถูกก็ยังนับ",
      "อ้างมาตราที่ไม่อยู่ในคลังเลยไปรวมอยู่ในตัวนับอ้างเท็จ ไม่ใช่ที่นี่",
    ],
  },
  recallAtK: {
    reading: "37.1% ของมาตราที่ศาลอ้างถูกค้นพบภายใน top k",
    symbols: [
      { symbol: "D_gold", meaning: "มาตราที่ศาลอ้องเองจริง" },
      { symbol: "D_top", meaning: "มาตราที่ retrieval คืนมาใน top k" },
    ],
    notes: [
      "นับแบบ any-hit คือเจอมาตราที่ถูกสักฉบับก็ได้คะแนน แบบ section-exact ต่างกันนิดเดียวบนคลังนี้",
      "คลังมีเฉพาะมาตราที่เป็นเฉลย 3,253 แถว ส่วนคลังเต็มต้นทางหมื่นแสนแถวยังไม่เปิดเผย ตัวเลขที่นี่จึงง่ายกว่าเงื่อนไขทางการ",
    ],
  },
  pAt1: {
    reading: "36.0% ของคำถามวางมาตราของเฉลยไว้อันดับแรกสุด",
    symbols: [
      { symbol: "d_i,1", meaning: "มาตราอันดับหนึ่งของคำถาม i" },
      { symbol: "1[·]", meaning: "1 ถ้าอันดับแรกเป็นเฉลย ไม่ใช่เป็น 0" },
    ],
    notes: [
      "P@1 ลงโทษ reranker อ่อน มาตราถูกแต่อยู่อันดับสองลงมาไม่ได้แต้ม",
      "คำถามหนึ่งมีเฉลยหลายมาตรา เจอสักมาตราอยู่ที่แรกก็นับว่าถูก",
    ],
  },
  hallucinated: {
    reading: "จำนวนการอ้างมาตราที่ไม่มีอยู่ในคลังเลยสักแห่ง",
    symbols: [
      { symbol: "c", meaning: "การอ้างที่โมเดลพ่นออกมาหนึ่งรายการ" },
      { symbol: "corpus", meaning: "มาตรา 3,253 ฉบับที่เราตรวจได้" },
    ],
    notes: [
      "อ้างสิ่งที่กฎหมายไม่เคยมีแย่กว่าอ้างผิดฉบับ ตัวเลขนี้ควรเป็น 0",
      "อ้างถึงมาตราที่อยู่นอกคลังทั้งหมดมาอยู่ที่ตัวนับนี้ ไม่กระทบ Citation F1",
    ],
  },
};
