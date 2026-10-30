import type { MetricId, MetricTechnicalCopy } from "@/types/metrics";

/**
 * The layer behind "Show the math": how to read the number, the exact formula,
 * its symbol legend, the stored column key, and implementation notes.
 *
 * TeX stays English (`\text{matched}`, `\mathrm{norm}`) — Thai glyphs inside a
 * KaTeX \text{} group fall back to a font that may not have them.
 */
export const TECHNICAL_DETAILS = {
  judge: {
    reading: "96 means 96 of every 100 answers were marked correct.",
    key: "LLMeval_judge_pct · n = 500",
    formula: {
      tex: String.raw`\mathrm{Judge} = \frac{100}{|K|} \sum_{i \in K} v_i`,
      symbols: [
        { symbol: "v_i", meaning: "1 if the judge says correct, 0 if not" },
        { symbol: "K", meaning: "questions with a readable verdict" },
        { symbol: "|K|", meaning: "how many questions that is" },
      ],
    },
    notes: [
      "Kimi-K3 grades at temperature 0, so the same answer gets the same verdict twice.",
      "Verdicts the judge cannot parse leave the denominator; they are not scored 0.",
      "The gold answer is a hint for the judge, not the only accepted wording.",
    ],
  },

  em: {
    reading:
      "Each question scores 0 or 1 after normalization; a paraphrased correct answer scores 0.",
    key: "EM (stored 0 to 1, displayed x100)",
    formula: {
      tex: String.raw`\begin{aligned}
\mathrm{EM} &= \frac{100}{N} \sum_{i=1}^{N} \max_{r}\\
&\quad \mathbf{1}\!\left[\mathrm{norm}(p_i) = \mathrm{norm}\!\left(g_i^{(r)}\right)\right]
\end{aligned}`,
      symbols: [
        { symbol: "N", meaning: "questions in the sample" },
        { symbol: "p_i", meaning: "the model's answer" },
        { symbol: "g_i^(r)", meaning: "reference answer r" },
        {
          symbol: "norm()",
          meaning: "lowercase, drop a/an/the, strip ASCII punctuation, collapse spaces",
        },
        { symbol: "1[·]", meaning: "1 when the test is true, 0 otherwise" },
      ],
    },
    notes: [
      "Normalization lowercases, removes English a/an/the, deletes ASCII punctuation and collapses whitespace.",
      "Whitespace is collapsed, not removed; Thai word boundaries still count for EM.",
      "With several references, the closest one counts toward that question.",
    ],
  },

  mth: {
    reading:
      "The whole gold answer must appear inside the model answer; one changed word scores the question 0.",
    key: "M_th (stored 0 to 1, displayed x100)",
    formula: {
      tex: String.raw`\begin{aligned}
M_{th} &= \frac{100}{N} \sum_{i=1}^{N} \max_{r}\\
&\quad \mathbf{1}\!\left[\mathrm{norm}_{th}\!\left(g_i^{(r)}\right) \subseteq \mathrm{norm}_{th}(p_i)\right]
\end{aligned}`,
      symbols: [
        { symbol: "norm_th()", meaning: "normalize, then remove every space" },
        { symbol: "⊆", meaning: "is contained in" },
        { symbol: "g_i^(r)", meaning: "reference answer r" },
        { symbol: "p_i", meaning: "the model's answer" },
      ],
    },
    notes: [
      "Containment, not overlap: the whole normalized gold answer must appear in the prediction.",
      "All or nothing per question: one changed word scores 0, even if every other word matches.",
      "Thai marks such as ฯ survive normalization because they are not ASCII punctuation.",
    ],
  },

  precision: {
    reading: "40 means 40% of the model's words also appear in the answer key.",
    key: "Precision_th (stored 0 to 1, displayed x100)",
    formula: {
      tex: String.raw`\mathrm{Precision}_{th} = \frac{100}{N} \sum_{i=1}^{N} \frac{m_i}{|\hat{Y}_i|}`,
      symbols: [
        { symbol: "m_i", meaning: "matched word pieces" },
        { symbol: "|Ŷ_i|", meaning: "word pieces the model wrote" },
        { symbol: "N", meaning: "questions in the sample" },
      ],
    },
    notes: [
      "Pieces come from PyThaiNLP newmm after normalize(); whitespace is dropped.",
      "Matching uses multiset intersection: a repeated word counts only as often as it appears on both sides.",
      "Each reference is scored separately, the best counts, then values are averaged over questions.",
    ],
  },

  recall: {
    reading: "83 means the model covered 83% of the answer key's words.",
    key: "Recall_th (stored 0 to 1, displayed x100)",
    formula: {
      tex: String.raw`\mathrm{Recall}_{th} = \frac{100}{N} \sum_{i=1}^{N} \frac{m_i}{|Y_i|}`,
      symbols: [
        { symbol: "m_i", meaning: "matched word pieces" },
        { symbol: "|Y_i|", meaning: "word pieces in the reference" },
        { symbol: "N", meaning: "questions in the sample" },
      ],
    },
    notes: [
      "Same tokenization and multiset intersection as precision, with the reference as the denominator.",
      "A short answer that leaves words out loses recall, even when every word it wrote was right.",
      "Averaged over questions, so one bad answer cannot sink a whole run.",
    ],
  },

  f1: {
    reading: "If either side is 0, F1 is 0.",
    key: "F1_th (stored 0 to 1, displayed x100)",
    formula: {
      tex: String.raw`\mathrm{F1}_{th} = \frac{100}{N} \sum_{i=1}^{N} \frac{2 P_i R_i}{P_i + R_i}`,
      symbols: [
        { symbol: "P_i", meaning: "precision for question i" },
        { symbol: "R_i", meaning: "recall for question i" },
        { symbol: "N", meaning: "questions in the sample" },
      ],
    },
    notes: [
      "Harmonic mean per question, so it stays high only when both precision and recall are high.",
      "F1 is averaged per question; it is not recomputed from the averaged precision and recall.",
      "If either side is 0, the harmonic mean is 0.",
    ],
  },

  generation: {
    reading: "The clock covers all 500 answers, not one.",
    key: "generation_time (h:mm:ss stored, minutes:seconds displayed)",
    formula: {
      tex: String.raw`T_{\mathrm{gen}} = t_{\mathrm{stop}} - t_{\mathrm{start}}`,
      symbols: [
        { symbol: "t_start", meaning: "clock starts at the generation call" },
        { symbol: "t_stop", meaning: "clock stops when every answer exists" },
        { symbol: "T_gen", meaning: "total for the whole sample" },
      ],
    },
    notes: [
      "The stopwatch wraps the generation call only. Retrieval and reranking happen before it starts.",
      "Includes prompt assembly, every model call, checkpoint writes and resume replay.",
      "Wall-clock on the run machine: compare runs with each other, not with a stopwatch.",
    ],
  },
} satisfies Record<MetricId, MetricTechnicalCopy>;
