import type { Language } from "@/hooks/use-language";
import type {
  DatasetStep,
  MethodologyChapterMeta,
  PipelineStage,
} from "@/types/methodology";

export const NITI_CHAPTERS_EN = {
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
    title: "Where the cases come from",
    icon: "fact_check",
    accent: { fg: "var(--metric-containment)", bg: "var(--metric-containment-bg)" },
  },
} as const satisfies Record<string, MethodologyChapterMeta>;

export const NITI_CHAPTERS_TH = {
  systemDesign: {
    id: "system-design",
    number: "01",
    title: "Pipeline ทดสอบโจทย์กฎหมาย",
    icon: "compare_arrows",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
  questionBank: {
    id: "question-bank",
    number: "02",
    title: "ที่มาของชุดคดี",
    icon: "fact_check",
    accent: { fg: "var(--metric-containment)", bg: "var(--metric-containment-bg)" },
  },
} as const satisfies Record<string, MethodologyChapterMeta>;

export function getNitiChapters(lang: Language = "EN") {
  return lang === "TH" ? NITI_CHAPTERS_TH : NITI_CHAPTERS_EN;
}

export const NITI_PIPELINE_STAGES_EN: readonly PipelineStage[] = [
  {
    label: "Question",
    value: "1 of 1,228",
    note: "a Thai legal sub-question; facts and earlier questions travel with it",
  },
  {
    label: "Retrieve",
    value: "top 100",
    note: "embedding search over 3,253 statute versions",
  },
  {
    label: "Rerank",
    value: "top 10",
    note: "optional second pass, can be skipped",
  },
  {
    label: "Answer",
    value: "top 5",
    note: "the model writes verdict, reasoning, and citations as JSON",
  },
] as const;

export const NITI_PIPELINE_STAGES_TH: readonly PipelineStage[] = [
  {
    label: "คำถาม",
    value: "1 ใน 1,228 ข้อ",
    note: "คำถามย่อยกฎหมาย แนบข้อเท็จจริงและคำถามก่อนหน้าไปด้วยทุกครั้ง",
  },
  {
    label: "ค้นหา",
    value: "Top 100",
    note: "ค้นด้วย embedding จากคลังมาตรา 3,253 ฉบับประกาศ",
  },
  {
    label: "จัดอันดับซ้ำ",
    value: "Top 10",
    note: "คัดกรองรอบสองด้วย reranker (ทำหรือไม่ทำก็ได้)",
  },
  {
    label: "สร้างคำตอบ",
    value: "Top 5",
    note: "โมเดลตอบเป็น JSON ครั้งละ verdict, เหตุผล และการอ้างมาตรา",
  },
] as const;

export function getNitiPipelineStages(
  lang: Language = "EN"
): readonly PipelineStage[] {
  return lang === "TH" ? NITI_PIPELINE_STAGES_TH : NITI_PIPELINE_STAGES_EN;
}

export const NITI_DATASET_STRIP_EN: readonly DatasetStep[] = [
  { title: "Real court decisions", line: "498 Thai cases with the court's reasoning and the statutes the court cited in judgment: 368 from the Supreme Court, 116 from the Supreme Administrative Court, 14 from the Constitutional Court, across 17 legal domains.", meta: "NitiBench+ (VISAI-AI)" },
  { title: "Cases become questions", line: "Each case splits into sub-questions on issuing points of law; chained questions carry the facts and earlier answers forward.", meta: "1,228 sub-questions" },
  { title: "Statutes by version", line: "The document pool stores every statute under its promulgation version — 3,253 rows; 1,132 sections exist in more than one version, so retrieving the right section with the wrong year is still wrong.", meta: "version-exact" },
  { title: "Bar-Council rubric judge", line: "Each case is graded once against the official Thai Bar Council exam rubric on a 0–10 scale; a wrong verdict caps the score at 4.", meta: "8 tiers · 0–10" },
  { title: "Citation check", line: "Every citation resolves against the version in force on the decision date; F1 is computed over statute-plus-version matches and hallucinated citations are counted separately.", meta: "version-exact F1" },
];

export const NITI_DATASET_STRIP_TH: readonly DatasetStep[] = [
  { title: "คำพิพากษาศาลจริง", line: "498 คดีจริงพร้อมเหตุผลของศาลและมาตราที่ศาลยกมาปรับกฎ แบ่งเป็น ศาลฎีกา 368 ศาลปกครองสูงสุด 116 ศาลรัฐธรรมนูญ 14 คลุม 17 ด้านกฎหมาย", meta: "NitiBench+ (VISAI-AI)" },
  { title: "คดีแยกเป็นคำถามย่อย", line: "แต่ละคดีแตกเป็นคำถามย่อยตามประเด็นกฎหมาย คำถามต่อเนื่องติดข้อเท็จจริงและคำตอบรอบก่อนหน้าไปเสมอ", meta: "1,228 คำถามย่อย" },
  { title: "มาตราแยกตามฉบับประกาศ", line: "คลังเก็บกฎหมายทุกมาตรารายฉบับประกาศรวม 3,253 แถว มี 1,132 มาตราที่หลายฉบับอยู่พร้อมกัน จึงค้นเจอถูกมาตราแต่ผิดปีไม่ได้ ถือว่าผิดทันที", meta: "version-exact" },
  { title: "Judge ตาม rubric ทนายสภา", line: "เกรดทีละคดีด้วย rubric สอบวิชาชีพทนายความของทนายสภา 8 ระดับ คะแนนเต็ม 10 ถ้าตอบผิดคำพิพากษาได้สูงสุดแค่ 4", meta: "8 ระดับ · 0–10" },
  { title: "ตรวจการอ้างอิง", line: "ทุกการอ้างถูกแปลงกับฉบับที่มีผลใช้บังคับ ณ วันพิพากษา แล้วคำนวณ F1 จากคู่มาตรา+ฉบับที่ตรง ส่วนการอ้างเท็จนับแยกต่างหาก", meta: "F1 version-exact" },
];

export function getNitiDatasetStrip(lang: Language = "EN"): readonly DatasetStep[] {
  return lang === "TH" ? NITI_DATASET_STRIP_TH : NITI_DATASET_STRIP_EN;
}

export const NITI_DATASET_SIZE = {
  bank: 1228,
  perRun: 1228,
  passages: 3253,
} as const;

export const NITI_DATASET_RESULT_EN =
  "Every score traces back to a real case and a statute version, so a wrong-year citation counts as a mistake, not a near-miss.";

export const NITI_DATASET_RESULT_TH =
  "ทุกคะแนนย้อนกลับไปถึงคดีจริงและมาตราฉบับที่ใช้จริงได้เสมอ การอ้างผิดปีจึงถูกนับเป็นความผิดพลาดเต็มตัวเลข ไม่ใช่คะแนนเกือบถูก";

export function getNitiDatasetResult(lang: Language = "EN"): string {
  return lang === "TH" ? NITI_DATASET_RESULT_TH : NITI_DATASET_RESULT_EN;
}

export const NITI_SOURCE = {
  href: "https://huggingface.co/datasets/VISAI-AI/nitibench-plus",
  labelEn: "Source: VISAI-AI/nitibench-plus",
  labelTh: "ต้นทาง: VISAI-AI/nitibench-plus",
} as const;
