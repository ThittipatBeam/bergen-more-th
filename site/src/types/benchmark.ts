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
  [key: string]: unknown;
}

export interface ExperimentRecord {
  experiment_id: string;
  run_date: string;
  dataset?: { doc?: { target?: string | null } | null } | null;
  retriever?: { model_name?: string | null } | null;
  reranker?: { model_name?: string | null } | null;
  generator?: { model_name?: string | null } | null;
  judge_candidates?: string[];
  metrics?: ExperimentMetrics | null;
  generation_time?: string | null;
}

/** One ranked row of the leaderboard, mapped from an ExperimentRecord. */
export interface BenchmarkRow {
  id: string;
  rank: number;
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
  recallTh: number;
  judgePct: number;
  genSeconds: number | null;
}

export interface ChampionMetric {
  label: string;
  value: string;
  detail: string;
}

export type MetricColumnKey =
  | "retriever"
  | "reranker"
  | "judgePct"
  | "mTh"
  | "em"
  | "f1Th"
  | "recallTh"
  | "latency";

export type ColumnVisibility = Record<MetricColumnKey, boolean>;
export type SortKey = MetricColumnKey | "rank";
export type SortDirection = "asc" | "desc";

export type RerankerFilter = "all" | "yes" | "no";

/** A category-winning experiment surfaced in the hero stacked card deck. */
export interface ChampionPick {
  id: "judge" | "speed" | "match";
  tabLabel: string;
  categoryTitle: string;
  badge: string;
  storyTitle: string;
  storyText: string;
  icon: "trophy" | "bolt" | "target";
  primaryMetric: ChampionMetric;
  secondaryMetric: ChampionMetric;
  accent: string;
  row: BenchmarkRow;
}
