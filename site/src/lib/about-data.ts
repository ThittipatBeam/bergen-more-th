import type { Language } from "@/hooks/use-language";
import type {
  AboutChapterMeta,
  AboutLink,
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
    icon: "help",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
  resources: {
    id: "resources",
    number: "02",
    title: "Open code and data",
    icon: "folder_open",
    accent: {
      fg: "var(--metric-containment)",
      bg: "var(--metric-containment-bg)",
    },
  },
  who: {
    id: "who-we-are",
    number: "03",
    title: "Who we are",
    icon: "cloud",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
} as const satisfies Record<string, AboutChapterMeta>;

export const ABOUT_CHAPTERS_TH = {
  why: {
    id: "why",
    number: "01",
    title: "ทำไมเราทำ benchmark นี้",
    icon: "help",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
  resources: {
    id: "resources",
    number: "02",
    title: "โค้ดและชุดข้อมูลเปิด",
    icon: "folder_open",
    accent: {
      fg: "var(--metric-containment)",
      bg: "var(--metric-containment-bg)",
    },
  },
  who: {
    id: "who-we-are",
    number: "03",
    title: "ผู้จัดทำ",
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
  "เทียบผล RAG จากงานวิจัยคนละชิ้นยาก เพราะแต่ละทีมใช้ชุดคำถาม พรอมต์ และวิธีตรวจคำตอบคนละชุด คะแนนเท่ากันจึงไม่ได้แปลว่าระบบทำงานเหมือนกัน เราเลยล็อกคลังเอกสาร คำถาม 500 ข้อ เทมเพลตพรอมต์ และตัว judge ไว้เหมือนเดิมทุกรัน เปลี่ยนแค่โมเดลที่อยากทดสอบ",
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

export function getAboutLinks(lang: Language = "EN"): readonly AboutLink[] {
  const isTh = lang === "TH";
  return [
    {
      label: isTh ? "คลังโค้ด" : "Code",
      name: "ThittipatBeam/bergen-more-th",
      description: isTh
        ? "ทั้งโค้ดไปป์ไลน์ พรอมต์ เครื่องมือรัน judge และสคริปต์คิดคะแนนของทุกรันที่เผยแพร่"
        : "Pipeline code, prompts, judge harness, and scoring scripts for every published run.",
      href: ABOUT_LINKS.code,
      cta: isTh ? "ดูคลังโค้ดบน GitHub" : "View repository",
      brand: "github",
    },
    {
      label: isTh ? "ชุดข้อมูล" : "Dataset",
      name: "siamaids/thai-wiki-qa-v1",
      description: isTh
        ? "คำถามภาษาไทย 5,355 ข้อจาก Thai Wikipedia พร้อมเฉลย ทุกรันวัดด้วย 500 ข้อชุดเดียวกัน"
        : "5,355 verified Thai Wikipedia questions with gold answers. Each run is scored on the same 500 questions.",
      href: ABOUT_LINKS.dataset,
      cta: isTh ? "ดูชุดข้อมูลบน Hugging Face" : "Open dataset",
      brand: "huggingface",
    },
    {
      label: isTh ? "เฟรมเวิร์กต้นแบบ" : "Harness",
      name: "Bergen",
      description: isTh
        ? "ตัวรันเบนช์มาร์กที่เราเอามาดัดเป็นเวอร์ชันภาษาไทย ระบบไปป์ไลน์กับการคิดคะแนนมาจากที่นี่"
        : "The benchmark harness we build on. Orchestration, retrieval, and scoring structure come from here.",
      href: ABOUT_LINKS.bergen,
      cta: isTh ? "ดูบน GitHub" : "View on GitHub",
      brand: "github",
    },
    {
      label: isTh ? "คลังข้อความ" : "Source text",
      name: "PyThaiNLP",
      description: isTh
        ? "เจ้าของบทความ thai-wiki-dataset-v4 และตัวตัดคำภาษาไทยที่ใช้ทั้งหน้านี้"
        : "Source of the Thai Wikipedia text and word segmentation used across the questions.",
      href: ABOUT_LINKS.pythainlp,
      cta: isTh ? "ดูบน Hugging Face" : "Open on Hugging Face",
      brand: "huggingface",
    },
  ];
}

export const ABOUT_LINK: readonly AboutLink[] = getAboutLinks("EN");

export function getAboutSponsors(lang: Language = "EN"): readonly AboutSponsor[] {
  const isTh = lang === "TH";
  return [
    {
      label: "Powered by",
      name: "SIAM.AI Cloud",
      description: isTh
        ? "ทุกการรันและการตรวจคำตอบอยู่บนคลัสเตอร์ GPU ของ SIAM.AI Cloud"
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
        ? "ขอบคุณทีม Cohere ที่ให้คีย์ API สำหรับประเมินผล ทำให้เรารันโมเดลของ Cohere ครบทุกตัวในเบนช์มาร์กนี้ได้"
        : "Thanks to the Cohere team for the evaluation API keys that made every Cohere model run in this benchmark possible.",
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
    return "SIAM.AI Cloud ให้บริการคลาวด์ GPU ในไทย เครื่องที่ใช้คือ NVIDIA B200, H200 และ H100 รองรับงาน Training, Fine-tune ไปจนถึง inference";
  }
  return "SIAM.AI Cloud provides GPU compute in Thailand on NVIDIA B200, H200, and H100 machines, for training, fine-tuning, and inference.";
}

export const WHO_WE_ARE = getWhoWeAre("EN");
