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

/** The four chapters, in reading order. */
export const ABOUT_CHAPTERS = {
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

export const WHY_PARAGRAPHS = [
  "RAG results are hard to compare: every paper uses its own pipeline, questions, and judge, so similar scores measure different things — and nothing shows which component did the work. This benchmark fixes the corpus, the 500 questions, the prompt, and the judge, then changes only the models.",
] as const;

/** The two halves of the comparison panel under the rationale. */
export const WHY_PANEL = {
  fixed: {
    label: "Held constant",
    value: "Thai Wikipedia corpus · 500 questions · prompt template · judge",
  },
  varied: {
    label: "Varied per run",
    value: "embedding model · reranker · generator",
  },
} as const;

export const ABOUT_RESOURCES: readonly AboutResource[] = [
  {
    kind: "code",
    name: "ThittipatBeam/bergen-more-th",
    description:
      "Pipeline code, prompts, judge harness, and scoring scripts for every published run.",
    href: ABOUT_LINKS.code,
    cta: "View repository",
    brand: "github",
  },
  {
    kind: "dataset",
    name: "siamaids/thai-wiki-qa-v1",
    description:
      "5,355 verified Thai Wikipedia questions with gold answers. Each run is scored on the same 500 of them.",
    href: ABOUT_LINKS.dataset,
    cta: "Open dataset",
    brand: "huggingface",
  },
];

export const ABOUT_CREDITS: readonly AboutCredit[] = [
  {
    name: "Bergen",
    role: "Harness",
    description:
      "The harness we fork. Orchestration, retrieval, and scoring come from here.",
    href: ABOUT_LINKS.bergen,
    brand: "github",
  },
  {
    name: "PyThaiNLP",
    role: "Source text",
    description:
      "Source of the Thai Wikipedia text our questions are built from.",
    href: ABOUT_LINKS.pythainlp,
    brand: "huggingface",
  },
];

export const ABOUT_POWERED_BY = {
  label: "Powered by",
  name: "SIAM.AI Cloud",
  description: "Every run is served and scored on SIAM.AI Cloud GPUs.",
  href: ABOUT_LINKS.cloud,
} as const;

/** Written from design/PRODUCT.md — public claims only. */
export const WHO_WE_ARE =
  "SIAM.AI Cloud is a Thailand-based AI provider. We run NVIDIA B200, H200 and H100 GPUs for training, fine-tuning and inference, and build Thai-first tools such as SiamGPT. This benchmark runs on the hardware we serve, and we publish the numbers either way.";
