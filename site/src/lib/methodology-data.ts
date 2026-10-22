import type {
  DatasetStep,
  MethodologyBlock,
  MethodologyChapterMeta,
  PipelineStage,
  ScoringChip,
} from "@/types/methodology";

/** The three questions the page answers, in reading order. */
export const METHODOLOGY_CHAPTERS = {
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

/** Kept verbatim: the system-design pillar. */
export const SYSTEM_DESIGN = {
  badge: "System Design",
  title: "Tri-Component Architecture",
  description:
    "Every Thai RAG pipeline under evaluation is decomposed into three strictly isolated components: dense embedding retriever, cross-encoder neural reranker, and generator LLM.",
  details: [
    "Dense vector search over segmented Thai text passages",
    "Optional cross-encoder reranking pass for semantic precision",
    "Context-grounded generative answer synthesis",
  ],
} as const satisfies MethodologyBlock;

/** One leaderboard row = this path, with a different model inside each stage. */
export const PIPELINE_STAGES: readonly PipelineStage[] = [
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

/** How the bank gets built, in the order the scripts run. */
export const DATASET_STEPS: readonly DatasetStep[] = [
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

/** Both live in one place so the bar, the tiles and the copy cannot drift. */
export const DATASET_SIZE = {
  bank: 5355,
  perRun: 500,
  passages: 179000,
} as const;

export const DATASET_RESULT =
  "5,355 pairs passed the generation and judge checks. Each one is still linked to the article it came from, so every score on the board can be traced back to a source.";

export const SAMPLE_REASONS = [
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

/** Kept verbatim: the scoring pillar. */
export const SCORING_PROTOCOL = {
  badge: "Scoring Protocol",
  title: "Deterministic LLM-as-a-Judge",
  description:
    "Responses are evaluated by KIMI-K3 operating with zero-temperature sampling to eliminate variance and score semantic correctness objectively.",
  details: [
    "Checks for hallucination against retrieved context",
    "Evaluates Thai language fluency and natural grammar",
    "Compares output against multi-reference human answers",
  ],
} as const satisfies MethodologyBlock;

export const SCORING_CHIPS: readonly ScoringChip[] = [
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
