import type { StoryScore, StoryToken } from "@/types/metrics";

/**
 * The single worked example the whole page refers back to.
 *
 * Verified by running modules/metrics.py with the repo's own venv against this
 * pair: PyThaiNLP newmm yields 6 tokens per side, 5 of them match, so
 * precision = recall = f1 = 83.3. ประเทศไทย splits into ประเทศ + ไทย — that is
 * why the count is six, and it must not be "tidied" to 4/5 = 80.
 *
 * The judge verdict is illustrative, not a logged benchmark prediction.
 */
export const WORKED_EXAMPLE = {
  question: {
    th: "เมืองหลวงของประเทศไทยคืออะไร?",
    en: "What is the capital of Thailand?",
  },
  reference: {
    th: "กรุงเทพมหานครเป็นเมืองหลวงของประเทศไทย",
    en: "Bangkok is the capital of Thailand.",
  },
  model: {
    th: "กรุงเทพฯ เป็นเมืองหลวงของประเทศไทย",
    en: "Bangkok is the capital of Thailand.",
  },
  matchedCount: 5,
  tokenCount: 6,
} as const;

export const REFERENCE_TOKENS: StoryToken[] = [
  { text: "กรุงเทพมหานคร", matched: false },
  { text: "เป็น", matched: true },
  { text: "เมืองหลวง", matched: true },
  { text: "ของ", matched: true },
  { text: "ประเทศ", matched: true },
  { text: "ไทย", matched: true },
];

export const MODEL_TOKENS: StoryToken[] = [
  { text: "กรุงเทพฯ", matched: false },
  { text: "เป็น", matched: true },
  { text: "เมืองหลวง", matched: true },
  { text: "ของ", matched: true },
  { text: "ประเทศ", matched: true },
  { text: "ไทย", matched: true },
];

/** Verdict strip under the example. */
export const STORY_SCORES: StoryScore[] = [
  { id: "judge", label: "Judge", value: "1", verdict: true },
  { id: "em", label: "EM", value: "0", verdict: false },
  { id: "mth", label: "Match TH", value: "0", verdict: false },
  { id: "precision", label: "Precision", value: "83.3", verdict: null },
  { id: "recall", label: "Recall", value: "83.3", verdict: null },
  { id: "f1", label: "F1", value: "83.3", verdict: null },
];
