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
      "Questions are written in Thai from Thai Wikipedia articles — not translated from an English set — then checked by a second model and spot-read by us.",
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
    title: "ไปป์ไลน์ที่ใช้ทดสอบ",
    intro:
      "ทุกระบบบนตารางใช้โครงสร้าง 3 ขั้นตอนเรียงต่อกันเหมือนกันทั้งหมด สิ่งที่เปลี่ยนมีเพียงโมเดลที่อยู่ข้างใน",
    icon: "compare_arrows",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
  questionBank: {
    id: "question-bank",
    number: "02",
    title: "ที่มาของชุดคำถาม",
    intro:
      "คำถามทุกข้อเขียนขึ้นจากบทความ Thai Wikipedia โดยตรง (ไม่ใช่ชุดแปลจากภาษาอังกฤษ) จากนั้นตรวจทานด้วยโมเดลอีกตัว และสุ่มอ่านตรวจด้วยคน",
    icon: "fact_check",
    accent: { fg: "var(--metric-containment)", bg: "var(--metric-containment-bg)" },
  },
  scoring: {
    id: "scoring",
    number: "03",
    title: "วิธีให้คะแนนและตรวจคำตอบ",
    intro:
      "เราใช้โมเดลแยกอีกตัวมาอ่านคำตอบและให้คะแนน โดยปิดความสุ่มทั้งหมด เพื่อให้คู่คำถามและคำตอบเดิมได้ผลลัพธ์ตรงกันเสมอ",
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
  title: "Three-Stage Architecture",
  description:
    "Each Thai RAG pipeline runs in three separate stages: a dense embedding retriever, an optional cross-encoder reranker, and a generator LLM.",
  details: [
    "Dense vector search across segmented Thai text passages",
    "Optional cross-encoder reranker to refine top candidate passages",
    "Generative answer written strictly from retrieved context",
  ],
};

export const SYSTEM_DESIGN_TH: MethodologyBlock = {
  badge: "การออกแบบระบบ",
  title: "ไปป์ไลน์ 3 ขั้นตอน",
  description:
    "ระบบ RAG ที่นำมาทดสอบจะแบ่งการทำงานเป็น 3 ขั้นตอนแยกจากกัน: โมเดล dense embedding สำหรับค้นหา, reranker แบบ cross-encoder สำหรับจัดอันดับซ้ำ และโมเดล generator สำหรับสร้างคำตอบ",
  details: [
    "ค้นหาข้อความด้วย dense vector บนบทความภาษาไทยที่ตัดคำแล้ว",
    "จัดอันดับเอกสารซ้ำด้วย cross-encoder เพื่อคัดเฉพาะพาสเสจที่ตรงจุด (เปิดหรือปิดได้)",
    "สร้างคำตอบโดยอ้างอิงจากเนื้อหาในเอกสารที่ค้นเจอเท่านั้น",
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
    label: "คำถาม",
    value: "1 ใน 500 ข้อ",
    note: "สุ่มคำถามจากคลังข้อสอบ",
  },
  {
    label: "ค้นหา",
    value: "Top 100",
    note: "ค้นหาด้วย embedding จาก 179,000 พาสเสจ",
  },
  {
    label: "จัดอันดับซ้ำ",
    value: "Top 10",
    note: "คัดกรองรอบสองด้วย reranker (ไม่บังคับ)",
  },
  {
    label: "สร้างคำตอบ",
    value: "Top 5",
    note: "โมเดลเขียนคำตอบจากพาสเสจ 5 ชิ้นที่ดีที่สุด",
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
      "We use thai-wiki-dataset-v4 from PyThaiNLP, keeping only main encyclopedia articles and filtering out Wikiquote and Wikibooks entries.",
    meta: "source: thwiki",
    source: {
      href: "https://huggingface.co/datasets/pythainlp/thai-wiki-dataset-v4",
      label: "Hugging Face dataset card · CC BY-SA 3.0",
    },
  },
  {
    title: "Keep substantive articles",
    body:
      "We segment each article into words with PyThaiNLP and drop anything under 200 words. That gives each question enough background context. A fixed random seed keeps the sample reproducible.",
    meta: "at least 200 words · seed 42",
  },
  {
    title: "Draft question-answer pairs",
    body:
      "DeepSeek-V4.1F writes two question-answer pairs per article. Answers must be short (between 2 and 10 words) and appear word-for-word in the source article so the model cannot invent facts.",
    meta: "2 pairs per article · answer checked against text",
  },
  {
    title: "Check each pair with a separate model",
    body:
      "KIMI-K3, rather than the model that wrote the draft, reads the article, question, and candidate answer, then outputs YES or NO. Having the authoring model grade its own work introduces obvious bias.",
    meta: "judge KIMI-K3 · temperature 0",
  },
  {
    title: "Spot-check with human review",
    body:
      "We review 50 randomly sampled pairs by hand, marking each as pass, fail, or skip. This confirms whether the automated judge is being too lenient.",
    meta: "50 random pairs · human pass / fail",
  },
] as const;

export const DATASET_STEPS_TH: readonly DatasetStep[] = [
  {
    title: "คัดเลือกบทความจาก Thai Wikipedia",
    body:
      "เริ่มต้นจาก thai-wiki-dataset-v4 ของ PyThaiNLP โดยเลือกเฉพาะบทความหลักในสารานุกรม และตัดหน้าคำคมกับหน้ารายชื่อหนังสือออก",
    meta: "แหล่งที่มา: thwiki",
    source: {
      href: "https://huggingface.co/datasets/pythainlp/thai-wiki-dataset-v4",
      label: "หน้าชุดข้อมูล Hugging Face · CC BY-SA 3.0",
    },
  },
  {
    title: "กรองเฉพาะบทความที่มีเนื้อหาเพียงพอ",
    body:
      "ตัดคำภาษาไทยด้วย PyThaiNLP และคัดบทความที่สั้นกว่า 200 คำออก เพื่อให้แน่ใจว่าแต่ละบทความมีบริบทพอสำหรับสร้างคำถาม พร้อมล็อก seed สุ่มไว้ที่ 42 เพื่อให้ทำซ้ำได้",
    meta: "อย่างน้อย 200 คำ · seed 42",
  },
  {
    title: "สร้างคู่คำถามและคำตอบ",
    body:
      "ให้ DeepSeek-V4.1F สร้างคำถามและคำตอบ 2 คู่ต่อบทความ กำหนดให้คำตอบสั้น (ระหว่าง 2 ถึง 10 คำ) และต้องมีข้อความปรากฏตรงในบทความจริงเพื่อไม่ให้โมเดลแต่งข้อมูลขึ้นมาเอง",
    meta: "2 คู่ต่อบทความ · ตรวจสอบคำตอบตรงกับข้อความจริง",
  },
  {
    title: "ตรวจซ้ำด้วยโมเดลอีกตัว",
    body:
      "ให้ KIMI-K3 ซึ่งเป็นคนละตัวกับที่สร้างคำถาม มาอ่านบทความ คำถาม และคำตอบ แล้วตัดสินว่า YES หรือ NO เพราะการให้โมเดลตรวจข้อสอบของตัวเองมักให้คะแนนเข้าข้างตัวเอง",
    meta: "judge KIMI-K3 · Temperature 0.0",
  },
  {
    title: "สุ่มตรวจความถูกต้องด้วยคน",
    body:
      "สุ่มตรวจ 50 คู่คำถาม-คำตอบด้วยคน ตัดสินเป็นผ่าน ไม่ผ่าน หรือข้าม ผลสุ่มตรวจบอกว่าโมเดล judge กับมนุษย์เห็นตรงกันบ่อยแค่ไหน — เป็นการตรวจสอบ judge ไม่ใช่การรับประกัน",
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
  "มีคำถามและคำตอบ 5,355 คู่ที่ผ่านการตรวจสอบครบทุกขั้นตอน ทุกข้อผูกโยงกลับไปยังบทความต้นฉบับ ทำให้ตรวจสอบที่มาของคะแนนได้เสมอ";

export function getDatasetResult(lang: Language = "EN"): string {
  return lang === "TH" ? DATASET_RESULT_TH : DATASET_RESULT_EN;
}

export const DATASET_RESULT = DATASET_RESULT_EN;

/** Repeat-run and spread stats computed from the board (see benchmark-data.ts). */
export interface SampleStats {
  maxRepeatGap: number;
  judgeSpread: number;
  judgeMin: number;
  judgeMax: number;
}

export function getSampleReasons(
  lang: Language = "EN",
  stats: SampleStats = {
    maxRepeatGap: 0,
    judgeSpread: 0,
    judgeMin: 0,
    judgeMax: 0,
  }
) {
  const isTh = lang === "TH";
  return [
    {
      title: isTh
        ? "ทุกไปป์ไลน์ตอบคำถาม 500 ข้อชุดเดียวกัน"
        : "Every pipeline answers the same 500 questions",
      body: isTh
        ? "คะแนนทุกแถวเทียบกันได้ตรงๆ: คำถามเดียวกัน คลังเอกสารเดียวกัน และ judge ตัวเดียวกัน"
        : "Scores compare directly across rows: same questions, same corpus, same judge.",
    },
    {
      title: isTh
        ? `ผลรันซ้ำห่างกันไม่เกิน ${stats.maxRepeatGap} คะแนน`
        : `Repeat runs land within ${stats.maxRepeatGap} judge ${
            stats.maxRepeatGap === 1 ? "point" : "points"
          }`,
      body: isTh
        ? `แต่ละไปป์ไลน์ถูกรันอย่างน้อยสองครั้ง ผลรันซ้ำห่างกันไม่เกิน ${stats.maxRepeatGap} คะแนน judge ขณะที่ generator ต่างกันมีช่วงคะแนนกว้างถึง ${stats.judgeSpread} คะแนน (${stats.judgeMin.toFixed(1)}–${stats.judgeMax.toFixed(1)})`
        : `Each pipeline runs at least twice. Repeats differ by at most ${stats.maxRepeatGap} judge ${
            stats.maxRepeatGap === 1 ? "point" : "points"
          }, while different generators span ${stats.judgeSpread} points across the board (${stats.judgeMin.toFixed(1)}–${stats.judgeMax.toFixed(1)}).`,
    },
    {
      title: isTh
        ? "อีก 4,855 ข้อเก็บไว้ในคลัง"
        : "The other 4,855 stay on file",
      body: isTh
        ? "คำถามส่วนที่เหลือเก็บไว้สำหรับการทดสอบละเอียด และใช้ตรวจว่าตัวอย่าง 500 ข้อไม่ได้เอื้อประโยชน์ให้โมเดลใดโดยเฉพาะ"
        : "Unused pairs remain available for deeper runs and for checking that the 500-question sample is not favoring one model.",
    },
  ];
}

export const SCORING_PROTOCOL_EN: MethodologyBlock = {
  badge: "Scoring Protocol",
  title: "Deterministic LLM Judging",
  description:
    "KIMI-K3 evaluates each answer at temperature 0, which removes randomness and gives consistent verdicts for the same input.",
  details: [
    "Reads the answer against the retrieved passages, with the gold answer as a hint rather than the truth",
    "Accepts a correct refusal when the retrieved context lacks the answer",
    "Never rewards fluency, length, or confidence — only factual correctness",
  ],
};

export const SCORING_PROTOCOL_TH: MethodologyBlock = {
  badge: "เกณฑ์การตัดสิน",
  title: "การตรวจคำตอบด้วย LLM Judge",
  description:
    "เราใช้ KIMI-K3 ตรวจคำตอบโดยตั้งค่า temperature เป็น 0 เพื่อตัดความสุ่ม และทำให้การตัดสินคำตอบเดิมคงที่ทุกครั้ง",
  details: [
    "อ่านคำตอบเทียบกับพาสเสจที่ค้นเจอ โดยใช้คำตอบเฉลยเป็นเครื่องชี้นำ ไม่ใช่คำตอบสุดท้าย",
    "ให้คะแนนเมื่อโมเดลตอบว่าไม่พบข้อมูล ในข้อที่เอกสารที่ค้นเจอไม่มีคำตอบจริง",
    "ไม่ให้คะแนนกับความลื่นไหล ความยาว หรือความมั่นใจ นับเฉพาะความถูกต้องของข้อเท็จจริง",
  ],
};

export function getScoringProtocol(lang: Language = "EN"): MethodologyBlock {
  return lang === "TH" ? SCORING_PROTOCOL_TH : SCORING_PROTOCOL_EN;
}

export const SCORING_PROTOCOL = SCORING_PROTOCOL_EN;

export const SCORING_CHIPS_EN: readonly ScoringChip[] = [
  {
    label: "Temperature 0.0",
    body: "The judge runs without random sampling, so the same question and answer pair always receives the same score.",
  },
  {
    label: "YES or NO",
    body: "The judge answers with a single word instead of a score out of 10, avoiding arbitrary grading scales.",
  },
  {
    label: "A different model",
    body: "The judge never grades text written by itself.",
  },
] as const;

export const SCORING_CHIPS_TH: readonly ScoringChip[] = [
  {
    label: "Temperature 0.0",
    body: "ปิดความสุ่มทั้งหมด เพื่อให้คำถามและคำตอบเดิมได้ผลลัพธ์ตรงกันทุกครั้ง",
  },
  {
    label: "ตอบ YES หรือ NO",
    body: "ตัดสินด้วยคำตอบชัดเจนเพียงคำเดียว ไม่ใช้คะแนนเต็ม 10 ซึ่งมักมีปัญหาเรื่องมาตรฐานคะแนนแกว่ง",
  },
  {
    label: "ใช้โมเดลคนละตัว",
    body: "โมเดลที่ทำหน้าที่ judge จะไม่ตรวจคำตอบที่ตัวเองเป็นผู้เขียน เพื่อป้องกันอคติ",
  },
] as const;

export function getScoringChips(lang: Language = "EN"): readonly ScoringChip[] {
  return lang === "TH" ? SCORING_CHIPS_TH : SCORING_CHIPS_EN;
}

export const SCORING_CHIPS = SCORING_CHIPS_EN;
