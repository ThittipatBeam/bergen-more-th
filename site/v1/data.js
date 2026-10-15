/* ============================================================
   TH RAG BENCHMARK — real measured data
   Source: experiments/dde75e7c03e34e16 (MKQA mkqa_th, dev split)
   Every number below is read from the on-disk run. Nothing fabricated.
   String metrics: eval_dev_metrics.json
   Judge: eval_dev_judge_KIMI-K3_partial.jsonl (post-hoc, resumable)
   ============================================================ */

const BENCH = {
  dataset: {
    id: "mkqa_th",
    name: "MKQA (lang = th)",
    split: "dev",
    questions: 2827,
    retrieval: "wiki-100w-th (TH Wikipedia chunks)",
    retriever: "BGE-M3 · top-100",
    reranker: "BGE-reranker-v2-M3 · top-10",
    generationTopK: 5
  },

  /* Display metrics, in column order. judge first — it is the headline.
     stringsUnder credit: true marks metrics that under-credit Thai. */
  metrics: [
    { id: "judge",   thLabel: "คะแนนผู้ตัดสิน",  enLabel: "Judge score",  pct: true, headline: true,
      thNote: "LLM ตัดสินความถูกต้องเทียบกับบริบทที่ดึงมา", enNote: "LLM judges factual correctness vs. retrieved context" },
    { id: "m_th",    thLabel: "M (TH)",          enLabel: "M_th" },
    { id: "f1_th",   thLabel: "F1 (TH)",         enLabel: "F1_th" },
    { id: "prec_th", thLabel: "Precision (TH)",  enLabel: "Precision_th" },
    { id: "rec_th",  thLabel: "Recall (TH)",     enLabel: "Recall_th" }
  ],

  /* Systems. measured:false rows are schema slots — honest placeholders
     for runs not yet executed. They render every cell as — (em-dash). */
  systems: [
    {
      id: "deepseek-v41f",
      name: "DeepSeek-V4.1F",
      measured: true,
      // Per-run pipeline: each run carries its own embedding + reranker model.
      // Change either and the run is a different system; both are reported per row.
      embedder: "bge-m3",
      reranker: "bge-reranker-v2-m3",
      judgePct: 69.7,           // LLMeval_judge_pct = 0.696852 × 100 over all 2,827 (complete)
      m_th: 23.2,               // 0.231694
      f1_th: 13.1,              // 0.130517
      prec_th: 10.0,            // 0.099768
      rec_th: 32.1              // 0.321220
    },

    /* Schema slots — reserved, not yet run. All cells render as — */
    {
      id: "slot-2",
      name: "deepseek",           // a second generator through the same pipeline
      displayName_en: "— next run —",
      displayName_th: "— รอการรัน —",
      measured: false
    },
    {
      id: "slot-3",
      name: "openweights",
      displayName_en: "— next run —",
      displayName_th: "— รอการรัน —",
      measured: false
    }
  ]
};
