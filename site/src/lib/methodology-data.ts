import type { Language } from "@/hooks/use-language";
import type {
  DatasetStep,
  MethodologyChapterMeta,
  PipelineStage,
} from "@/types/methodology";

export const METHODOLOGY_CHAPTERS_EN = {
  systemDesign: {
    id: "system-design",
    number: "01",
    title: "What we run",
    icon: "compare_arrows",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
  questionBank: {
    id: "question-bank",
    number: "02",
    title: "Where the questions come from",
    icon: "fact_check",
    accent: { fg: "var(--metric-containment)", bg: "var(--metric-containment-bg)" },
  },
} as const satisfies Record<string, MethodologyChapterMeta>;

export const METHODOLOGY_CHAPTERS_TH = {
  systemDesign: {
    id: "system-design",
    number: "01",
    title: "Pipeline สำหรับการทดสอบ",
    icon: "compare_arrows",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
  questionBank: {
    id: "question-bank",
    number: "02",
    title: "ที่มาของชุดคำถาม",
    icon: "fact_check",
    accent: { fg: "var(--metric-containment)", bg: "var(--metric-containment-bg)" },
  },
} as const satisfies Record<string, MethodologyChapterMeta>;

export function getMethodologyChapters(lang: Language = "EN") {
  return lang === "TH" ? METHODOLOGY_CHAPTERS_TH : METHODOLOGY_CHAPTERS_EN;
}

export const METHODOLOGY_CHAPTERS = METHODOLOGY_CHAPTERS_EN;


export const PIPELINE_STAGES_EN: readonly PipelineStage[] = [
  {
    label: "Question",
    value: "1 of 500",
    note: "a Thai question from the bank",
  },
  {
    label: "Retrieve",
    value: "top 100",
    note: "embedding search over 179k context",
  },
  {
    label: "Rerank",
    value: "top 10",
    note: "optional second pass, can be skipped",
  },
  {
    label: "Answer",
    value: "top 5",
    note: "the model writes from these context",
  },
] as const;

export const PIPELINE_STAGES_TH: readonly PipelineStage[] = [
  {
    label: "คำถาม",
    value: "1 ใน 500 ข้อ",
    note: "คำถามจากชุด context เดียวกันทุกรัน",
  },
  {
    label: "ค้นหา",
    value: "Top 100",
    note: "ค้นหาด้วย embedding จาก 179,000 context",
  },
  {
    label: "จัดอันดับซ้ำ",
    value: "Top 10",
    note: "คัดกรองรอบสองด้วย reranker (ทำหรือไม่ทำก็ได้)",
  },
  {
    label: "สร้างคำตอบ",
    value: "Top 5",
    note: "โมเดลเขียนคำตอบจาก context 5 ชิ้นที่ดีที่สุด",
  },
] as const;

export function getPipelineStages(lang: Language = "EN"): readonly PipelineStage[] {
  return lang === "TH" ? PIPELINE_STAGES_TH : PIPELINE_STAGES_EN;
}

export const PIPELINE_STAGES = PIPELINE_STAGES_EN;

export const DATASET_STRIP_EN: readonly DatasetStep[] = [
  { title: "Source articles", line: "Main articles from PyThaiNLP thai-wiki-dataset-v4; Wikiquote and Wikibooks filtered out.", meta: "thai-wiki-dataset-v4" },
  { title: "Filter", line: "Keep articles of at least 200 segmented words, sampled with a fixed seed.", meta: "≥ 200 words · seed 42" },
  { title: "Draft with DeepSeek-V4.1F", line: "DeepSeek-V4.1F writes 2 question-answer pairs per article; the answer must appear in the text word-for-word.", meta: "2 pairs per article · answers 2–10 words" },
  { title: "Verify with KIMI-K3", line: "KIMI-K3, not the drafting model, reads each pair and votes YES or NO at temperature 0.", meta: "YES or NO · temp 0" },
  { title: "Spot-check by hand", line: "Humans spot-check 50 random pairs: the answer must really appear in the article and be correct.", meta: "50 random pairs" },
];

export const DATASET_STRIP_TH: readonly DatasetStep[] = [
  { title: "บทความต้นทาง", line: "เอาเฉพาะบทความหลักจาก thai-wiki-dataset-v4 ของ PyThaiNLP ตัดพวกหน้า Wikiquote กับ Wikibooks ออก", meta: "thai-wiki-dataset-v4" },
  { title: "กรองบทความ", line: "คัดเฉพาะบทความที่ยาวตั้งแต่ 200 คำขึ้นไปหลังตัดคำ สุ่มด้วย seed เดิมเสมอ", meta: "≥ 200 คำ · seed 42" },
  { title: "เขียนด้วย DeepSeek-V4.1F", line: "ให้ DeepSeek-V4.1F เขียนคำถามกับคำตอบ 2 คู่ต่อบทความ คำตอบต้องตรงกับข้อความในบทความเป๊ะ", meta: "2 คู่ต่อบท · คำตอบ 2–10 คำ" },
  { title: "ตรวจด้วย KIMI-K3", line: "KIMI-K3 ซึ่งไม่ใช่ตัวที่เขียนคำถาม อ่านแต่ละคู่แล้วตอบ YES หรือ NO ด้วย temperature 0", meta: "YES หรือ NO · temp 0" },
  { title: "สุ่มตรวจด้วยคน", line: "คนอ่านตรวจแบบสุ่ม 50 คู่ ว่าคำตอบมาจากบทความจริงและตอบถูกหรือไม่", meta: "สุ่ม 50 คู่" },
];

export function getDatasetStrip(lang: Language = "EN"): readonly DatasetStep[] {
  return lang === "TH" ? DATASET_STRIP_TH : DATASET_STRIP_EN;
}


export const DATASET_SIZE = {
  bank: 5355,
  perRun: 500,
  passages: 179000,
} as const;

export const DATASET_RESULT_EN =
  "5,355 pairs passed the generation and judge checks. Each one is still linked to the article it came from, so every score on the board can be traced back to a source.";

export const DATASET_RESULT_TH =
  "คำถามทุกข้อย้อนกลับไปหาบทความต้นทางได้เสมอ และคำตอบต้องมาจากข้อความในบทความจริงเป๊ะ";

export function getDatasetResult(lang: Language = "EN"): string {
  return lang === "TH" ? DATASET_RESULT_TH : DATASET_RESULT_EN;
}

export const DATASET_RESULT = DATASET_RESULT_EN;
