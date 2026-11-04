/** Shape of one record produced by scripts/scan_experiments.py. */
export interface ExperimentMetrics {
  M?: number;
  M_th?: number;
  EM?: number;
  F1?: number;
  F1_th?: number;
  Precision_th?: number;
  Recall?: number;
  Recall_th?: number;
  LLMeval_judge_pct?: number;
  LLMeval_judge_n?: number;
  /* NitiBench+ (Thai legal) metrics — official Bar-Council 8-tier rubric
     judge (0-10) plus local Citation F1 matching. */
  niti_rubric_bar_standard?: number;
  niti_rubric_bar_standard_pct?: number;
  niti_rubric_micro?: number;
  niti_rubric_unknown_rate?: number;
  niti_rubric_n_cases?: number;
  niti_rubric_judge?: string;
  niti_citation_f1?: number;
  niti_citation_f1_macro?: number;
  niti_citation_precision?: number;
  niti_citation_recall?: number;
  niti_citation_hallucinated?: number;
  niti_citation_n_cases?: number;
  niti_citation_mode?: string;
  [key: string]: unknown;
}

export interface ExperimentRecord {
  experiment_id: string;
  run_date: string;
  dataset?: {
    doc?: { target?: string | null } | null;
    query?: { target?: string | null; split?: string | null } | null;
  } | null;
  retriever?: { model_name?: string | null } | null;
  reranker?: { model_name?: string | null } | null;
  generator?: { model_name?: string | null } | null;
  judge_candidates?: string[];
  metrics?: ExperimentMetrics | null;
  /** Retrieval diagnostics, e.g. {"P_1": 0.36, "recall_5": 0.371}. */
  ranking_metrics?: Record<string, number> | null;
  generation_time?: string | null;
}

/** One ranked row of the leaderboard, mapped from an ExperimentRecord. */
export interface BenchmarkRow {
  id: string;
  rank: number;
  /** Rows sharing a rounded Q score share a rank; 1 when unique. */
  tieCount: number;
  retriever: string;
  reranker: string | null;
  generator: string;
  dataset: string;
  runDate: string;
  judgeName: string | null;
  judgeN: number | null;
  mTh: number;
  em: number;
  f1Th: number;
  precisionTh: number;
  recallTh: number;
  judgePct: number;
  /** Overall score — the weighted blend that ranks the board. */
  q: number;
  genSeconds: number | null;
}

export interface ChampionMetric {
  label: string;
  value: string;
  detail?: string;
}

export type MetricColumnKey =
  | "retriever"
  | "reranker"
  | "q"
  | "judgePct"
  | "mTh"
  | "f1Th"
  | "precisionTh"
  | "recallTh"
  | "em"
  | "latency";

export type ColumnVisibility = Record<MetricColumnKey, boolean>;
export type SortKey = MetricColumnKey | "rank";
export type SortDirection = "asc" | "desc";

export type RerankerFilter = "all" | "yes" | "no";

/** The two boards the leaderboard section can show. */
export type LeaderboardMode = "wikipedia" | "nitibench";

/** How a NitiBench+ run got its statutes. */
export type NitiMode = "RAG" | "Parametric" | "Gold-cited";

/** One ranked row of the NitiBench+ board, keyed on rubric + citation. */
export interface NitiBenchRow {
  id: string;
  rank: number;
  /** Rows sharing a rounded bar-standard score share a rank; 1 when unique. */
  tieCount: number;
  mode: NitiMode;
  retriever: string | null;
  reranker: string | null;
  generator: string;
  runDate: string;
  /** Official Bar-standard score, 0-10 (the ranking key). */
  rubricBar: number;
  rubricMicro: number;
  /** Fraction of sub-questions the judge could not grade. */
  unknownRate: number;
  judgeModel: string | null;
  /** Citation F1 / precision / recall, all 0-100 for display. */
  citationF1: number;
  citationF1Macro: number;
  citationPrecision: number;
  citationRecall: number;
  hallucinated: number | null;
  /** Version-exact Recall@k and P@1 from ranking_metrics, 0-100; null when absent. */
  recallAtK: number | null;
  pAt1: number | null;
  /** Cases judged — full benchmark is 498; pilots show fewer. */
  nCases: number | null;
  genSeconds: number | null;
}

/** A category-winning experiment surfaced in the hero stacked card deck. */
/** The card face of a board row — BenchmarkRow and NitiBenchRow both fit. */
export interface ChampionRowSource {
  rank: number;
  retriever: string | null;
  reranker: string | null;
  generator: string;
}

export interface ChampionPick {
  id: "quality" | "speed" | "match";
  tabLabel: string;
  categoryTitle: string;
  badge: string;
  storyTitle: string;
  storyText: string;
  icon: "trophy" | "bolt" | "target";
  primaryMetric: ChampionMetric;
  secondaryMetric: ChampionMetric;
  accent: string;
  row: ChampionRowSource;
}
