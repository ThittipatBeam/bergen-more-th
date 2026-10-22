import type { Language } from "@/hooks/use-language";
import type {
  DatasetStep,
  MethodologyBlock,
  MethodologyChapterMeta,
  PipelineStage,
  ScoringChip,
} from "@/types/methodology";

export const METHODOLOGY_CHAPTERS_EN = {
  systemDesign: {
    id: "system-design",
    number: "01",
    title: "What we run",
    intro:
      "Every system on the board is built from the same three parts, in the same order. Only the models inside them change.",
    icon: "compare_arrows",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
  questionBank: {
    id: "question-bank",
    number: "02",
    title: "Where the questions come from",
    intro:
      "We do not reuse a translated English dataset. We build Thai questions from Thai Wikipedia, check every one with a second model, then read a sample by eye.",
    icon: "fact_check",
    accent: { fg: "var(--metric-containment)", bg: "var(--metric-containment-bg)" },
  },
  scoring: {
    id: "scoring",
    number: "03",
    title: "How answers are scored",
    intro:
      "A separate model reads each answer and decides whether it is right. The same question and answer always get the same verdict.",
    icon: "gavel",
    accent: { fg: "var(--metric-overlap)", bg: "var(--metric-overlap-bg)" },
  },
} as const satisfies Record<string, MethodologyChapterMeta>;

export const METHODOLOGY_CHAPTERS_TH = {
  systemDesign: {
    id: "system-design",
    number: "01",
    title: "สถาปัตยกรรมระบบที่ใช้ทดสอบ",
    intro:
      "ทุกโมเดลบนลีดเดอร์บอร์ดถูกทดสอบบนไปป์ไลน์มาตรฐาน 3 ขั้นตอนเดียวกัน โดยเปลี่ยนเฉพาะตัวโมเดลที่นำมาทดสอบ",
    icon: "compare_arrows",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
  questionBank: {
    id: "question-bank",
    number: "02",
    title: "ที่มาของชุดคำถาม Benchmark",
    intro:
      "เราไม่ใช้ชุดข้อมูลแปลจากภาษาอังกฤษ แต่สร้างชุดคำถามภาษาไทยแท้จาก Thai Wikipedia ตรวจสอบซ้ำด้วยโมเดลอิสระ และสุ่มตรวจคุณภาพด้วยมนุษย์",
    icon: "fact_check",
    accent: { fg: "var(--metric-containment)", bg: "var(--metric-containment-bg)" },
  },
  scoring: {
    id: "scoring",
    number: "03",
    title: "เกณฑ์การให้คะแนนและการตัดสิน",
    intro:
      "ใช้โมเดลอิสระตรวจความถูกต้องของคำตอบแบบ Deterministic เพื่อให้คำถามและคำตอบคู่เดียวกันได้ผลการตัดสินคงที่เสมอ",
    icon: "gavel",
    accent: { fg: "var(--metric-overlap)", bg: "var(--metric-overlap-bg)" },
  },
} as const satisfies Record<string, MethodologyChapterMeta>;

export function getMethodologyChapters(lang: Language = "EN") {
  return lang === "TH" ? METHODOLOGY_CHAPTERS_TH : METHODOLOGY_CHAPTERS_EN;
}

export const METHODOLOGY_CHAPTERS = METHODOLOGY_CHAPTERS_EN;

export const SYSTEM_DESIGN_EN: MethodologyBlock = {
  badge: "System Design",
  title: "Tri-Component Architecture",
  description:
    "Every Thai RAG pipeline under evaluation is decomposed into three strictly isolated components: dense embedding retriever, cross-encoder neural reranker, and generator LLM.",
  details: [
    "Dense vector search over segmented Thai text passages",
    "Optional cross-encoder reranking pass for semantic precision",
    "Context-grounded generative answer synthesis",
  ],
};

export const SYSTEM_DESIGN_TH: MethodologyBlock = {
  badge: "การออกแบบระบบ",
  title: "สถาปัตยกรรม RAG 3 องค์ประกอบ",
  description:
    "ทุกไปป์ไลน์ Thai RAG ถูกแยกองค์ประกอบอย่างอิสระ 3 ส่วน: Dense Embedding Retriever, Cross-Encoder Neural Reranker และ Generator LLM",
  details: [
    "ค้นหาด้วย Dense Vector Search บนคอร์ปัสภาษาไทยที่ตัดคำแล้ว",
    "เพิ่มความแม่นยำเชิงความหมายด้วย Cross-Encoder Reranker (เปิด/ปิดได้)",
    "สร้างคำตอบโดยอิงตามบริบทเอกสารจริง (Context-grounded synthesis)",
  ],
};

export function getSystemDesign(lang: Language = "EN"): MethodologyBlock {
  return lang === "TH" ? SYSTEM_DESIGN_TH : SYSTEM_DESIGN_EN;
}

export const SYSTEM_DESIGN = SYSTEM_DESIGN_EN;

export const PIPELINE_STAGES_EN: readonly PipelineStage[] = [
  {
    label: "Question",
    value: "1 of 500",
    note: "a Thai question from the bank",
  },
  {
    label: "Retrieve",
    value: "top 100",
    note: "embedding search over 179k passages",
  },
  {
    label: "Rerank",
    value: "top 10",
    note: "optional second pass, can be skipped",
  },
  {
    label: "Answer",
    value: "top 5",
    note: "the model writes from these passages",
  },
] as const;

export const PIPELINE_STAGES_TH: readonly PipelineStage[] = [
  {
    label: "คำถาม (Question)",
    value: "1 ใน 500 ข้อ",
    note: "คำถามภาษาไทยจากชุดข้อสอบ",
  },
  {
    label: "ค้นคืน (Retrieve)",
    value: "Top 100",
    note: "ค้นหาด้วย Embedding จาก 179,000 พาสเสจ",
  },
  {
    label: "จัดอันดับซ้ำ (Rerank)",
    value: "Top 10",
    note: "สเต็ปเสริมเพื่อคัดกรองความหมาย (ข้ามได้)",
  },
  {
    label: "สร้างคำตอบ (Answer)",
    value: "Top 5",
    note: "โมเดลเขียนคำตอบจากพาสเสจที่ดีที่สุด",
  },
] as const;

export function getPipelineStages(lang: Language = "EN"): readonly PipelineStage[] {
  return lang === "TH" ? PIPELINE_STAGES_TH : PIPELINE_STAGES_EN;
}

export const PIPELINE_STAGES = PIPELINE_STAGES_EN;

export const DATASET_STEPS_EN: readonly DatasetStep[] = [
  {
    title: "Start from Thai Wikipedia",
    body:
      "We take PyThaiNLP's thai-wiki-dataset-v4 — the Thai Wikipedia text released by the PyThaiNLP project. We keep main articles only, so quotes and books are filtered out.",
    meta: "source: thwiki",
    source: {
      href: "https://huggingface.co/datasets/pythainlp/thai-wiki-dataset-v4",
      label: "Hugging Face dataset card · CC BY-SA 3.0",
    },
  },
  {
    title: "Keep the articles with something to ask about",
    body:
      "Each article is split into words with PyThaiNLP. Anything under 200 words is dropped, so every question has real content behind it. A fixed random seed keeps the sample reproducible.",
    meta: "at least 200 words · seed 42",
  },
  {
    title: "A model writes the first draft",
    body:
      "DeepSeek-V4.1F writes two question and answer pairs per article. Answers are kept short (2–10 words) and must appear word-for-word in the article, so they cannot be invented.",
    meta: "2 pairs per article · answer checked against the text",
  },
  {
    title: "A second model checks every pair",
    body:
      "KIMI-K3 — not the model that wrote them — reads the article, the question and the answer, and replies YES or NO. A writer that grades its own work tends to say yes.",
    meta: "judge KIMI-K3 · temperature 0",
  },
  {
    title: "A person reads a sample",
    body:
      "A small internal tool shows 50 random pairs. A person marks each pass, fail or skip — a human check on whether the model judge is being too generous.",
    meta: "50 random pairs · human pass / fail",
  },
] as const;

export const DATASET_STEPS_TH: readonly DatasetStep[] = [
  {
    title: "เริ่มต้นจากคลังบทความ Thai Wikipedia",
    body:
      "ใช้ thai-wiki-dataset-v4 จากโครงการ PyThaiNLP โดยคัดเลือกเฉพาะบทความหลัก ตัดเนื้อหาหมวดคำคมและรายการหนังสือออกเพื่อรักษาคุณภาพของเนื้อหา",
    meta: "แหล่งที่มา: thwiki",
    source: {
      href: "https://huggingface.co/datasets/pythainlp/thai-wiki-dataset-v4",
      label: "หน้าชุดข้อมูล Hugging Face · CC BY-SA 3.0",
    },
  },
  {
    title: "คัดกรองเฉพาะบทความที่มีสาระสำคัญชัดเจน",
    body:
      "ตัดคำด้วย PyThaiNLP และคัดออกบทความที่สั้นกว่า 200 คำ เพื่อให้ทุกคำถามมีข้อมูลอ้างอิงเพียงพอ พร้อมกำหนด Random Seed คงที่เพื่อความโปร่งใสและทำซ้ำได้",
    meta: "อย่างน้อย 200 คำ · seed 42",
  },
  {
    title: "สร้างคำถาม-คำตอบตั้งต้นด้วยโมเดลภาษา",
    body:
      "ให้ DeepSeek-V4.1F สร้างชุดคำถาม-คำตอบ 2 คู่ต่อบทความ กำหนดคำตอบให้กระชับ (2–10 คำ) และต้องมีข้อความปรากฏตรงในบทความจริงเพื่อป้องกันอาการ Hallucination",
    meta: "2 คู่ต่อบทความ · ตรวจสอบคำตอบตรงกับข้อความจริง",
  },
  {
    title: "ตรวจทานความถูกต้องด้วยโมเดลภายนอก",
    body:
      "ใช้ KIMI-K3 (โมเดลคนละตัวกับที่สร้างคำถาม) มาตรวจสอบบทความ คำถาม และคำตอบ ตอบ YES หรือ NO เพื่อหลีกเลี่ยงอคติจากการประเมินผลตัวเอง",
    meta: "judge KIMI-K3 · Temperature 0.0",
  },
  {
    title: "สุ่มตรวจสอบมาตรฐานโดยผู้เชี่ยวชาญ (Human Check)",
    body:
      "สุ่มตรวจ 50 คู่คำถาม-คำตอบด้วยสายตาคน เพื่อตรวจสอบว่าโมเดล Judge ไม่ได้ให้คะแนนแบบหละหลวมเกินไป",
    meta: "สุ่ม 50 คู่ · มนุษย์ตรวจผ่าน / ไม่ผ่าน",
  },
] as const;

export function getDatasetSteps(lang: Language = "EN"): readonly DatasetStep[] {
  return lang === "TH" ? DATASET_STEPS_TH : DATASET_STEPS_EN;
}

export const DATASET_STEPS = DATASET_STEPS_EN;

export const DATASET_SIZE = {
  bank: 5355,
  perRun: 500,
  passages: 179000,
} as const;

export const DATASET_RESULT_EN =
  "5,355 pairs passed the generation and judge checks. Each one is still linked to the article it came from, so every score on the board can be traced back to a source.";

export const DATASET_RESULT_TH =
  "มี 5,355 คู่คำถาม-คำตอบที่ผ่านการตรวจสอบทั้งสองชั้น ทุกข้อเชื่อมโยงกลับไปยังบทความต้นฉบับ ทุกคะแนนบนลีดเดอร์บอร์ดจึงสามารถตรวจสอบย้อนกลับได้เสมอ";

export function getDatasetResult(lang: Language = "EN"): string {
  return lang === "TH" ? DATASET_RESULT_TH : DATASET_RESULT_EN;
}

export const DATASET_RESULT = DATASET_RESULT_EN;

export const SAMPLE_REASONS_EN = [
  {
    title: "The same 500 for every pipeline",
    body:
      "Every row answers the exact same questions, so the comparison is like for like.",
  },
  {
    title: "Big enough to tell pipelines apart",
    body:
      "Near the top, the gaps between pipelines are wider than the noise a 500-question sample adds.",
  },
  {
    title: "The rest stay on file",
    body:
      "The remaining pairs are kept for deeper runs and for checking that the sample is not flattering one model.",
  },
] as const;

export const SAMPLE_REASONS_TH = [
  {
    title: "ใช้ 500 ข้อเดียวกันในทุกไปป์ไลน์",
    body:
      "ทุกโมเดลตอบคำถามชุดเดียวกันเป๊ะ เพื่อให้การเปรียบเทียบเป็นธรรมและวัดผลได้ตรงจุด",
  },
  {
    title: "ขนาดกลุ่มตัวอย่างเพียงพอที่จะแยกความต่าง",
    body:
      "ความต่างของคะแนนในกลุ่มหัวตารางกว้างกว่า Noise ของกลุ่มตัวอย่าง 500 ข้ออย่างมีนัยสำคัญ",
  },
  {
    title: "คำถามส่วนที่เหลือเก็บไว้ทดสอบเชิงลึก",
    body:
      "เก็บคำถามที่เหลือไว้สำหรับการทดสอบระดับลึก และใช้ตรวจเช็คว่ากลุ่มตัวอย่างไม่ได้เอื้อประโยชน์ให้โมเดลใดโมเดลหนึ่ง",
  },
] as const;

export function getSampleReasons(lang: Language = "EN") {
  return lang === "TH" ? SAMPLE_REASONS_TH : SAMPLE_REASONS_EN;
}

export const SAMPLE_REASONS = SAMPLE_REASONS_EN;

export const SCORING_PROTOCOL_EN: MethodologyBlock = {
  badge: "Scoring Protocol",
  title: "Deterministic LLM-as-a-Judge",
  description:
    "Responses are evaluated by KIMI-K3 operating with zero-temperature sampling to eliminate variance and score semantic correctness objectively.",
  details: [
    "Checks for hallucination against retrieved context",
    "Evaluates Thai language fluency and natural grammar",
    "Compares output against multi-reference human answers",
  ],
};

export const SCORING_PROTOCOL_TH: MethodologyBlock = {
  badge: "เกณฑ์การตัดสิน (Scoring Protocol)",
  title: "Deterministic LLM-as-a-Judge",
  description:
    "ประเมินคำตอบด้วย KIMI-K3 โดยตั้งค่า Temperature เป็น 0.0 เพื่อตัดความแปรปรวน และให้คะแนนความถูกต้องเชิงความหมายอย่างเที่ยงตรง",
  details: [
    "ตรวจจับอาการ Hallucination เทียบกับ Context ที่ค้นคืนมา",
    "ประเมินความสละสลวยและความถูกต้องตามไวยากรณ์ไทย",
    "เปรียบเทียบผลลัพธ์กับคำตอบเฉลย (Ground Truth Reference)",
  ],
};

export function getScoringProtocol(lang: Language = "EN"): MethodologyBlock {
  return lang === "TH" ? SCORING_PROTOCOL_TH : SCORING_PROTOCOL_EN;
}

export const SCORING_PROTOCOL = SCORING_PROTOCOL_EN;

export const SCORING_CHIPS_EN: readonly ScoringChip[] = [
  {
    label: "Temperature 0.0",
    body: "The judge is not allowed to improvise, so the same pair always gets the same verdict.",
  },
  {
    label: "YES or NO",
    body: "One word, not a score out of ten — there is no scale to calibrate.",
  },
  {
    label: "A different model",
    body: "The judge never grades text written by itself.",
  },
] as const;

export const SCORING_CHIPS_TH: readonly ScoringChip[] = [
  {
    label: "Temperature 0.0",
    body: "ไม่อนุญาตให้โมเดลสุ่มคำตอบ เพื่อให้คู่คำถาม-คำตอบเดิมได้ผลลัพธ์เดิมเสมอ",
  },
  {
    label: "YES หรือ NO",
    body: "ตัดสินด้วยคำเดียว ไม่ใช้คะแนนเต็ม 10 จึงไม่มีปัญหาเรื่องสเกลคะแนนแกว่ง",
  },
  {
    label: "ใช้โมเดลคนละตัว",
    body: "โมเดล Judge จะไม่ตรวจงานที่ตัวเองเป็นคนเขียน เพื่อความยุติธรรม",
  },
] as const;

export function getScoringChips(lang: Language = "EN"): readonly ScoringChip[] {
  return lang === "TH" ? SCORING_CHIPS_TH : SCORING_CHIPS_EN;
}

export const SCORING_CHIPS = SCORING_CHIPS_EN;
