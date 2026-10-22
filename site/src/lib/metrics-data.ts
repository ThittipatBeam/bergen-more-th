import { TECHNICAL_DETAILS } from "@/lib/metrics-technical";
import type {
  MetricChapter,
  MetricDefinition,
  MetricId,
} from "@/types/metrics";

/**
 * Collapsed copy: a question (≤8 words), one sentence (≤18) and one example
 * line (≤12). Everything longer lives in metrics-technical.ts, behind the
 * card's own "Show the math" disclosure.
 */
export const METRICS = {
  judge: {
    id: "judge",
    name: "Judge",
    icon: "gavel",
    family: "quality",
    direction: "higher",
    simple: {
      question: "Would a reader say it's right?",
      explanation: "A second AI reads each answer and says yes or no.",
      example: "Right meaning, different spelling → 1",
    },
    technical: TECHNICAL_DETAILS.judge,
  },

  em: {
    id: "em",
    name: "Exact Match",
    icon: "match_case",
    family: "containment",
    direction: "higher",
    simple: {
      question: "Same words as the answer key?",
      explanation: "Both sides are cleaned up, then must be identical.",
      example: "Same meaning, different spelling → 0",
    },
    technical: TECHNICAL_DETAILS.em,
  },

  mth: {
    id: "mth",
    name: "Match TH",
    icon: "select_check_box",
    family: "containment",
    direction: "higher",
    simple: {
      question: "Is the whole key inside the answer?",
      explanation: "Spaces ignored. One changed word means no.",
      example: "One changed word → 0",
    },
    technical: TECHNICAL_DETAILS.mth,
  },

  precision: {
    id: "precision",
    name: "Precision",
    icon: "compress",
    family: "overlap",
    direction: "higher",
    simple: {
      question: "Any extra words?",
      explanation: "Every word the model adds lowers it.",
      example: "5 of 6 words used → 83.3",
    },
    technical: TECHNICAL_DETAILS.precision,
  },

  recall: {
    id: "recall",
    name: "Recall",
    icon: "done_all",
    family: "overlap",
    direction: "higher",
    simple: {
      question: "Any missing words?",
      explanation: "Every word the model drops lowers it.",
      example: "5 of 6 words covered → 83.3",
    },
    technical: TECHNICAL_DETAILS.recall,
  },

  f1: {
    id: "f1",
    name: "F1",
    icon: "scale",
    family: "overlap",
    direction: "higher",
    simple: {
      question: "Extra and missing, in one number?",
      explanation: "High only when both sides are high.",
      example: "Both 83.3 → F1 83.3",
    },
    technical: TECHNICAL_DETAILS.f1,
  },

  generation: {
    id: "generation",
    name: "Generation time",
    icon: "timer",
    family: "speed",
    direction: "lower",
    simple: {
      question: "How long to write all 500?",
      explanation: "Writing only — search and ranking ran before.",
      example: "Total for all 500 answers, not one answer.",
    },
    technical: TECHNICAL_DETAILS.generation,
  },
} satisfies Record<MetricId, MetricDefinition>;

export const METRIC_CHAPTERS: MetricChapter[] = [
  {
    id: "is-it-right",
    number: "01",
    title: "Is it right?",
    icon: "fact_check",
    intro:
      "Three tests of correctness, from a reader's judgement to an exact string.",
    payoff:
      "Same meaning, different spelling: the judge says yes, EM and Match TH say no.",
    family: "quality",
    metrics: ["judge", "em", "mth"],
  },
  {
    id: "word-overlap",
    number: "02",
    title: "How close are the words?",
    icon: "compare_arrows",
    intro: "Thai has no spaces, so answers are split into word pieces first.",
    payoff:
      "Match TH says 0, yet F1 says 83.3 — partial word matches still count.",
    family: "overlap",
    metrics: ["precision", "recall", "f1"],
  },
  {
    id: "speed",
    number: "03",
    title: "How fast?",
    icon: "speed",
    intro: "One stopwatch: how long did the model spend writing?",
    payoff: "Speed only compares when you know what the clock excludes.",
    family: "speed",
    metrics: ["generation"],
  },
];
