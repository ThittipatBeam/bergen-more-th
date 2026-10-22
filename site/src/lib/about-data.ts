import type { Language } from "@/hooks/use-language";
import type {
  AboutChapterMeta,
  AboutCredit,
  AboutResource,
} from "@/types/about";

/** Every external place the About page points to. */
export const ABOUT_LINKS = {
  code: "https://github.com/ThittipatBeam/bergen-more-th",
  dataset: "https://huggingface.co/datasets/siamaids/thai-wiki-qa-v1",
  bergen: "https://github.com/naver/bergen",
  pythainlp: "https://huggingface.co/datasets/pythainlp/thai-wiki-dataset-v4",
  cloud: "https://siam.ai/",
} as const;

export const ABOUT_CHAPTERS_EN = {
  why: {
    id: "why",
    number: "01",
    title: "Why we do it",
    intro:
      "Two pipelines can report the same score and still behave differently.",
    icon: "help",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
  resources: {
    id: "resources",
    number: "02",
    title: "Resources",
    intro: "The code and the dataset behind every number on the board.",
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
    intro: "Thanks to the projects that made this possible.",
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
    title: "ทำไมเราถึงทำ Benchmark นี้",
    intro:
      "RAG ไปป์ไลน์สองตัวอาจได้คะแนนเท่ากัน แต่พฤติกรรมจริงกลับต่างกันอย่างสิ้นเชิง",
    icon: "help",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
  resources: {
    id: "resources",
    number: "02",
    title: "คลังโค้ดและชุดข้อมูลเปิด (Resources)",
    intro: "ซอร์สโค้ดและชุดข้อมูลเบื้องหลังทุกตัวเลขบนลีดเดอร์บอร์ด",
    icon: "folder_open",
    accent: {
      fg: "var(--metric-containment)",
      bg: "var(--metric-containment-bg)",
    },
  },
  acknowledgements: {
    id: "acknowledgements",
    number: "03",
    title: "กิตติกรรมประกาศ",
    intro: "ขอขอบคุณโครงการโอเพนซอร์สที่ทำให้ Benchmark นี้เกิดขึ้นได้",
    icon: "handshake",
    accent: { fg: "var(--metric-overlap)", bg: "var(--metric-overlap-bg)" },
  },
  who: {
    id: "who-we-are",
    number: "04",
    title: "เกี่ยวกับทีมงาน",
    intro: "ทีมงานผู้อยู่เบื้องหลังโครงการ",
    icon: "cloud",
    accent: { fg: "var(--brand-text)", bg: "var(--surface-brand)" },
  },
} as const satisfies Record<string, AboutChapterMeta>;

export function getAboutChapters(lang: Language = "EN") {
  return lang === "TH" ? ABOUT_CHAPTERS_TH : ABOUT_CHAPTERS_EN;
}

export const ABOUT_CHAPTERS = ABOUT_CHAPTERS_EN;

export const WHY_PARAGRAPHS_EN = [
  "RAG results are hard to compare: every paper uses its own pipeline, questions, and judge, so similar scores measure different things — and nothing shows which component did the work. This benchmark fixes the corpus, the 500 questions, the prompt, and the judge, then changes only the models.",
] as const;

export const WHY_PARAGRAPHS_TH = [
  "การเปรียบเทียบผลลัพธ์ของ RAG ในปัจจุบันทำได้ยาก เพราะแต่ละงานวิจัยใช้ไปป์ไลน์ ชุดคำถาม และเกณฑ์ประเมินที่ต่างกัน ทำให้คะแนนที่ใกล้เคียงกันวัดสิ่งที่ไม่เหมือนกัน และไม่สามารถบอกได้ว่าองค์ประกอบส่วนไหนทำงานได้ดีจริง เราจึงสร้าง Benchmark นี้ขึ้นโดยฟิกซ์คลังข้อมูล, ชุดคำถาม 500 ข้อ, รูปแบบ Prompt และโมเดล Judge ให้คงที่ แล้วทดสอบด้วยการเปลี่ยนเฉพาะตัวโมเดลเท่านั้น",
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
    label: "องค์ประกอบที่คงที่",
    value: "คลังข้อมูล Thai Wikipedia · 500 คำถาม · รูปแบบ Prompt · โมเดล Judge",
  },
  varied: {
    label: "องค์ประกอบที่ทดสอบ",
    value: "โมเดล Embedding · โมเดล Reranker · โมเดล Generator",
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
        ? "โค้ดไปป์ไลน์, Prompts, ชุดรัน LLM Judge และสคริปต์คำนวณคะแนนสำหรับทุกผลการทดสอบ"
        : "Pipeline code, prompts, judge harness, and scoring scripts for every published run.",
      href: ABOUT_LINKS.code,
      cta: isTh ? "ดูคลังโค้ดบน GitHub" : "View repository",
      brand: "github",
    },
    {
      kind: "dataset",
      name: "siamaids/thai-wiki-qa-v1",
      description: isTh
        ? "ชุดคำถาม Thai Wikipedia 5,355 ข้อพร้อมคำตอบเฉลยที่ผ่านการตรวจสอบแล้ว โดยทุกการทดลองวัดผลบน 500 ข้อเดียวกัน"
        : "5,355 verified Thai Wikipedia questions with gold answers. Each run is scored on the same 500 of them.",
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
        ? "เฟรมเวิร์กต้นแบบที่เรานำมาต่อยอด ทั้งระบบ Orchestration, Retrieval และ Scoring"
        : "The harness we fork. Orchestration, retrieval, and scoring come from here.",
      href: ABOUT_LINKS.bergen,
      brand: "github",
    },
    {
      name: "PyThaiNLP",
      role: isTh ? "คลังข้อความและตัดคำ" : "Source text",
      description: isTh
        ? "ระบบตัดคำและประมวลผลภาษาไทย โดยคลังข้อความตั้งต้นมาจากชุดข้อมูล thai-wiki-dataset-v4"
        : "Source of the Thai Wikipedia text our questions are built from.",
      href: ABOUT_LINKS.pythainlp,
      brand: "huggingface",
    },
  ];
}

export const ABOUT_CREDITS: readonly AboutCredit[] = getAboutCredits("EN");

export function getAboutPoweredBy(lang: Language = "EN") {
  const isTh = lang === "TH";
  return {
    label: isTh ? "โครงสร้างพื้นฐานโดย" : "Powered by",
    name: "SIAM.AI Cloud",
    description: isTh
      ? "ทุกการทดสอบรันและประเมินผลบนคลัสเตอร์ GPU ของ SIAM.AI Cloud"
      : "Every run is served and scored on SIAM.AI Cloud GPUs.",
    href: ABOUT_LINKS.cloud,
  };
}

export const ABOUT_POWERED_BY = getAboutPoweredBy("EN");

export function getWhoWeAre(lang: Language = "EN"): string {
  if (lang === "TH") {
    return "SIAM.AI Cloud เป็นผู้ให้บริการโครงสร้างพื้นฐาน AI ในประเทศไทย เราให้บริการคลัสเตอร์ GPU ประสิทธิภาพสูงสำหรับการฝึกโมเดล (Training), Fine-tuning และ Inference พร้อมทั้งพัฒนาเครื่องมือ AI ภาษาไทย เช่น SiamGPT เกณฑ์ Benchmark นี้ทำงานบนฮาร์ดแวร์จริงที่เราให้บริการ และเราเผยแพร่ผลลัพธ์อย่างโปร่งใสตรงไปตรงมา";
  }
  return "SIAM.AI Cloud is a Thailand-based AI provider. We run NVIDIA B200, H200 and H100 GPUs for training, fine-tuning and inference, and build Thai-first tools such as SiamGPT. This benchmark runs on the hardware we serve, and we publish the numbers either way.";
}

export const WHO_WE_ARE = getWhoWeAre("EN");
