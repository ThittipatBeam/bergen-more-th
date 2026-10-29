import type { Language } from "@/hooks/use-language";
import type {
  AboutChapterMeta,
  AboutCredit,
  AboutResource,
  AboutSponsor,
} from "@/types/about";

/** Every external place the About page points to. */
export const ABOUT_LINKS = {
  code: "https://github.com/ThittipatBeam/bergen-more-th",
  dataset: "https://huggingface.co/datasets/siamaids/thai-wiki-qa-v1",
  bergen: "https://github.com/naver/bergen",
  pythainlp: "https://huggingface.co/datasets/pythainlp/thai-wiki-dataset-v4",
  cloud: "https://siam.ai/",
  cohere: "https://cohere.com/",
} as const;

export const ABOUT_CHAPTERS_EN = {
  why: {
    id: "why",
    number: "01",
    title: "Why we do it",
    intro: "Scores only compare when everything except the models stays fixed.",
    icon: "help",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
  resources: {
    id: "resources",
    number: "02",
    title: "Resources",
    intro: "The code and dataset behind every number on the board.",
    icon: "folder_open",
    accent: {
      fg: "var(--metric-containment)",
      bg: "var(--metric-containment-bg)",
    },
  },
  acknowledgements: {
    id: "acknowledgements",
    number: "03",
    title: "Acknowledgements",
    intro: "Open-source projects this benchmark builds on.",
    icon: "handshake",
    accent: { fg: "var(--metric-overlap)", bg: "var(--metric-overlap-bg)" },
  },
  who: {
    id: "who-we-are",
    number: "04",
    title: "Who we are",
    intro: "The team behind the board.",
    icon: "cloud",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
} as const satisfies Record<string, AboutChapterMeta>;

export const ABOUT_CHAPTERS_TH = {
  why: {
    id: "why",
    number: "01",
    title: "ทำไมถึงจัดทำ Benchmark นี้",
    intro: "คะแนนจะเทียบกันได้ ก็ต่อเมื่อทุกอย่างนอกจากโมเดลถูกล็อกให้คงที่",
    icon: "help",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
  resources: {
    id: "resources",
    number: "02",
    title: "โค้ดและชุดข้อมูลเปิด",
    intro: "ซอร์สโค้ดและชุดข้อมูลเบื้องหลังคะแนนทั้งหมดบนตาราง",
    icon: "folder_open",
    accent: {
      fg: "var(--metric-containment)",
      bg: "var(--metric-containment-bg)",
    },
  },
  acknowledgements: {
    id: "acknowledgements",
    number: "03",
    title: "โครงการที่นำมาต่อยอด",
    intro: "เครื่องมือและชุดข้อมูลโอเพนซอร์สที่เรานำมาพัฒนาต่อ",
    icon: "handshake",
    accent: { fg: "var(--metric-overlap)", bg: "var(--metric-overlap-bg)" },
  },
  who: {
    id: "who-we-are",
    number: "04",
    title: "ผู้จัดทำ",
    intro: "ทีมงาน SIAM.AI Cloud",
    icon: "cloud",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
} as const satisfies Record<string, AboutChapterMeta>;

export function getAboutChapters(lang: Language = "EN") {
  return lang === "TH" ? ABOUT_CHAPTERS_TH : ABOUT_CHAPTERS_EN;
}

export const ABOUT_CHAPTERS = ABOUT_CHAPTERS_EN;

export const WHY_PARAGRAPHS_EN = [
  "Comparing RAG results across papers is difficult because setups vary widely. Each paper uses its own document split, questions, and scoring prompt, so the same number can describe different questions, different corpora, and a different judge. We keep the document corpus, the 500 questions, the prompt, and the judge model constant, and swap only the models being tested.",
] as const;

export const WHY_PARAGRAPHS_TH = [
  "การเทียบผล RAG ระหว่างงานวิจัยมักทำได้ยาก เพราะแต่ละทีมใช้ชุดคำถาม พรอมต์ และวิธีตรวจคำตอบไม่เหมือนกัน คะแนนที่เท่ากันจึงไม่ได้แปลว่าทำงานเหมือนกัน เบนช์มาร์กนี้จึงล็อกคลังเอกสาร คำถาม 500 ข้อ เทมเพลตพรอมต์ และโมเดล judge ให้เหมือนกันทุกรอบ แล้วเปลี่ยนเฉพาะโมเดลที่นำมาทดสอบเท่านั้น",
] as const;

export function getWhyParagraphs(lang: Language = "EN") {
  return lang === "TH" ? WHY_PARAGRAPHS_TH : WHY_PARAGRAPHS_EN;
}

export const WHY_PARAGRAPHS = WHY_PARAGRAPHS_EN;

export const WHY_PANEL_EN = {
  fixed: {
    label: "Held constant",
    value: "Thai Wikipedia corpus · 500 questions · prompt template · judge",
  },
  varied: {
    label: "Varied per run",
    value: "embedding model · reranker · generator",
  },
} as const;

export const WHY_PANEL_TH = {
  fixed: {
    label: "ตัวแปรควบคุม (คงที่)",
    value: "คลังเอกสาร Thai Wikipedia · คำถาม 500 ข้อ · รูปแบบ prompt · โมเดล judge",
  },
  varied: {
    label: "ตัวแปรที่ทดสอบ",
    value: "โมเดล embedding · reranker · generator",
  },
} as const;

export function getWhyPanel(lang: Language = "EN") {
  return lang === "TH" ? WHY_PANEL_TH : WHY_PANEL_EN;
}

export const WHY_PANEL = WHY_PANEL_EN;

export function getAboutResources(lang: Language = "EN"): readonly AboutResource[] {
  const isTh = lang === "TH";
  return [
    {
      kind: "code",
      name: "ThittipatBeam/bergen-more-th",
      description: isTh
        ? "โค้ดไปป์ไลน์ เทมเพลตพรอมต์ สคริปต์รัน LLM judge และโค้ดคำนวณคะแนนทุกชุดที่เผยแพร่"
        : "Pipeline code, prompts, judge harness, and scoring scripts for every published run.",
      href: ABOUT_LINKS.code,
      cta: isTh ? "ดูคลังโค้ดบน GitHub" : "View repository",
      brand: "github",
    },
    {
      kind: "dataset",
      name: "siamaids/thai-wiki-qa-v1",
      description: isTh
        ? "ชุดคำถามภาษาไทย 5,355 ข้อจาก Thai Wikipedia พร้อมคำตอบเฉลย ทุกการทดสอบจะวัดผลด้วยคำถาม 500 ข้อชุดเดียวกัน"
        : "5,355 verified Thai Wikipedia questions with gold answers. Each run is scored on the same 500 questions.",
      href: ABOUT_LINKS.dataset,
      cta: isTh ? "ดูชุดข้อมูลบน Hugging Face" : "Open dataset",
      brand: "huggingface",
    },
  ];
}

export const ABOUT_RESOURCES: readonly AboutResource[] = getAboutResources("EN");

export function getAboutCredits(lang: Language = "EN"): readonly AboutCredit[] {
  const isTh = lang === "TH";
  return [
    {
      name: "Bergen",
      role: isTh ? "เฟรมเวิร์กต้นแบบ" : "Harness",
      description: isTh
        ? "เฟรมเวิร์กที่เรานำมาปรับแต่งสำหรับภาษาไทย ทั้งการจัดการไปป์ไลน์ การค้นคืน และการคำนวณคะแนน"
        : "The benchmark harness we build on. Orchestration, retrieval, and scoring structure come from here.",
      href: ABOUT_LINKS.bergen,
      brand: "github",
    },
    {
      name: "PyThaiNLP",
      role: isTh ? "คลังข้อความและตัดคำ" : "Source text",
      description: isTh
        ? "ชุดข้อมูลบทความ thai-wiki-dataset-v4 และเครื่องมือตัดคำภาษาไทยที่ใช้ประมวลผลข้อความ"
        : "Source of the Thai Wikipedia text and word segmentation used across the questions.",
      href: ABOUT_LINKS.pythainlp,
      brand: "huggingface",
    },
  ];
}

export const ABOUT_CREDITS: readonly AboutCredit[] = getAboutCredits("EN");

export function getAboutSponsors(lang: Language = "EN"): readonly AboutSponsor[] {
  const isTh = lang === "TH";
  return [
    {
      label: "Powered by",
      name: "SIAM.AI Cloud",
      description: isTh
        ? "การรันโมเดลและการตรวจคำตอบทั้งหมดทำงานบนคลัสเตอร์ GPU ของ SIAM.AI Cloud"
        : "Every run is served and scored on SIAM.AI Cloud GPUs.",
      href: ABOUT_LINKS.cloud,
      hrefLabel: "siam.ai",
      tone: "brand",
      icon: "brandmark",
    },
    {
      label: "Model APIs by",
      name: "Cohere",
      description: isTh
        ? "ทีม Cohere ให้คีย์ API สำหรับประเมินโมเดลของ Cohere ทุกตัวที่เราทดสอบ ส่วนโมเดลอื่น ๆ อย่าง DeepSeek และ Qwen ทำงานบนโครงสร้างพื้นฐานของ SIAM.AI เอง"
        : "Cohere model runs use evaluation API keys provided by the Cohere team. Every other model — DeepSeek, Qwen, the rest — runs on SIAM.AI infrastructure.",
      href: ABOUT_LINKS.cohere,
      hrefLabel: "cohere.com",
      tone: "positive",
      icon: "cohere",
    },
  ];
}

export const ABOUT_SPONSORS = getAboutSponsors("EN");

export function getWhoWeAre(lang: Language = "EN"): string {
  if (lang === "TH") {
    return "SIAM.AI Cloud ให้บริการคลาวด์ GPU ในไทย บนฮาร์ดแวร์ NVIDIA B200, H200 และ H100 สำหรับงานเทรนโมเดล ไฟน์ทูน และรัน inference รวมถึงพัฒนาโมเดลภาษาไทยอย่าง SiamGPT เราทดสอบเบนช์มาร์กนี้บนเครื่องที่เราให้บริการจริง และเปิดเผยตัวเลขทุกชุดโดยไม่คัดเฉพาะผลที่ต้องการ";
  }
  return "SIAM.AI Cloud provides GPU compute in Thailand, running clusters with NVIDIA B200, H200, and H100 hardware for model training, fine-tuning, and inference. We also build tools for Thai NLP, including SiamGPT. We run this benchmark on our own cloud infrastructure and publish all scores openly.";
}

export const WHO_WE_ARE = getWhoWeAre("EN");
