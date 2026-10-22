import rawExperiments from "./experiments-data.json";
import type {
  BenchmarkRow,
  ChampionPick,
  ExperimentRecord,
} from "@/types/benchmark";

/** "modules.dataset_processor.ThaiWikiV4" -> "ThaiWikiV4" */
const shortName = (path: string) => path.split(/[/.]/).pop() ?? path;

/** "KIMI-K3_500" -> "KIMI-K3" (trailing sample-size suffix dropped, n lives in metrics) */
const judgeShortName = (candidate: string) => candidate.replace(/_\d+$/, "");

/** "00:10:02.08" -> 602.08 seconds; null when unparseable. */
const parseClock = (clock: string): number | null => {
  const match = /^(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/.exec(clock);
  if (!match) return null;
  return (
    Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])
  );
};

/** m:ss display for generation time. */
export const formatClock = (seconds: number | null): string => {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const toPercent = (v: number | undefined | null): number => {
  if (typeof v !== "number") return 0;
  return v <= 1 ? v * 100 : v;
};

/**
 * Overall score: one ranked number built from the four metrics that measure
 * correctness, weighted by how much each one tells us. Judge carries the most
 * because it is the only score that accepts a correct paraphrase; EM carries the
 * least because a correct answer in different words still scores 0. Weights sum
 * to 1, and generation time stays out — speed is a separate axis, not a
 * quality signal. Keep this in sync with the /metrics explainer.
 */
export const QUALITY_WEIGHTS = {
  judgePct: 0.45,
  mTh: 0.2,
  f1Th: 0.2,
  em: 0.15,
} as const;

export const qualityScore = (
  row: Pick<BenchmarkRow, "judgePct" | "mTh" | "f1Th" | "em">
): number =>
  row.judgePct * QUALITY_WEIGHTS.judgePct +
  row.mTh * QUALITY_WEIGHTS.mTh +
  row.f1Th * QUALITY_WEIGHTS.f1Th +
  row.em * QUALITY_WEIGHTS.em;

const toRow = (exp: ExperimentRecord): BenchmarkRow | null => {
  const metrics = exp.metrics ?? {};
  const retriever = exp.retriever?.model_name;
  const generator = exp.generator?.model_name;
  const judgePct = metrics.LLMeval_judge_pct;
  if (!retriever || !generator || typeof judgePct !== "number") return null;
  const scored = {
    id: exp.experiment_id,
    rank: 0,
    tieCount: 1,
    retriever,
    reranker: exp.reranker?.model_name ?? null,
    generator,
    dataset: exp.dataset?.doc?.target ? shortName(exp.dataset.doc.target) : "—",
    runDate: exp.run_date,
    judgeName: exp.judge_candidates?.[0]
      ? judgeShortName(exp.judge_candidates[0])
      : null,
    judgeN: metrics.LLMeval_judge_n ?? null,
    mTh: toPercent(metrics.M_th),
    em: toPercent(metrics.EM),
    f1Th: toPercent(metrics.F1_th),
    precisionTh: toPercent(metrics.Precision_th),
    recallTh: toPercent(metrics.Recall_th),
    judgePct,
    genSeconds: exp.generation_time ? parseClock(exp.generation_time) : null,
  };
  return { ...scored, q: qualityScore(scored) };
};

/** Valid experiments (junk/null records dropped), ranked by overall score. */
const sortedRows = (rawExperiments as unknown as ExperimentRecord[])
  .map(toRow)
  .filter((row): row is BenchmarkRow => row !== null)
  .sort((a, b) => b.q - a.q || b.judgePct - a.judgePct);

/** Competition ranking on the displayed (one-decimal) score, so visual ties
 *  never receive different medals. */
let lastDisplayedScore: number | null = null;
let lastRank = 0;
const rankedRows = sortedRows.map((row, index) => {
  const displayed = Math.round(row.q * 10);
  if (displayed !== lastDisplayedScore) {
    lastRank = index + 1;
    lastDisplayedScore = displayed;
  }
  return { ...row, rank: lastRank };
});

const tieCounts = new Map<number, number>();
for (const row of rankedRows) {
  tieCounts.set(row.rank, (tieCounts.get(row.rank) ?? 0) + 1);
}

export const BENCHMARK_ROWS: BenchmarkRow[] = rankedRows.map((row) => ({
  ...row,
  tieCount: tieCounts.get(row.rank) ?? 1,
}));

const firstWithJudge = BENCHMARK_ROWS.find((row) => row.judgeName);

export const JUDGE_NAME = firstWithJudge?.judgeName ?? "KIMI-K3";
export const JUDGE_N = firstWithJudge?.judgeN ?? 500;

/** Observed overall-score range; drives the sequential tint so every band is used. */
const qualityScores = BENCHMARK_ROWS.map((row) => row.q);
export const QUALITY_MIN = qualityScores.length ? Math.min(...qualityScores) : 0;
export const QUALITY_MAX = qualityScores.length ? Math.max(...qualityScores) : 100;

const byBest = (pick: (row: BenchmarkRow) => number) =>
  [...BENCHMARK_ROWS].sort((a, b) => pick(b) - pick(a))[0];

const qualityBest = byBest((row) => row.q);
const speedBest = byBest((row) =>
  row.genSeconds === null ? Number.NEGATIVE_INFINITY : -row.genSeconds
);
const matchBest = byBest((row) => row.mTh);

/** Category champions shown in the hero stacked card deck. */
export const CHAMPION_PICKS: ChampionPick[] = [];

if (qualityBest) {
  CHAMPION_PICKS.push({
    id: "quality",
    tabLabel: "Best overall",
    categoryTitle: "Highest Overall Quality",
    badge: "#1 Overall",
    storyTitle: `Highest overall score: ${qualityBest.q.toFixed(1)} of 100.`,
    storyText: `${qualityBest.generator} paired with ${qualityBest.retriever} balances judge approval with exactness and Thai word overlap better than any other pipeline on the board.`,
    icon: "trophy",
    accent: "var(--brand-text)",
    primaryMetric: {
      label: "Overall Score",
      value: qualityBest.q.toFixed(1),
      detail: "45% judge · 20% Match TH · 20% F1 · 15% EM",
    },
    secondaryMetric: {
      label: "LLM Judge Score",
      value: `${qualityBest.judgePct.toFixed(1)}%`,
      detail: `Judged by ${qualityBest.judgeName ?? "Kimi-K3"}${
        qualityBest.judgeN ? ` · n=${qualityBest.judgeN}` : ""
      }`,
    },
    row: qualityBest,
  });
}

if (speedBest) {
  CHAMPION_PICKS.push({
    id: "speed",
    tabLabel: "Fastest delivery",
    categoryTitle: "Fastest Generation",
    badge: "Top Speed",
    storyTitle: "Fastest model generation on the 500-question sample.",
    storyText: `${speedBest.generator} generated all 500 answers in ${formatClock(
      speedBest.genSeconds
    )}, maintaining a competitive ${speedBest.judgePct.toFixed(1)}% judge score.`,
    icon: "bolt",
    accent: "var(--perf-text)",
    primaryMetric: {
      label: "Generation Time",
      value: formatClock(speedBest.genSeconds),
      detail: "Generation only · excludes retrieval and scoring",
    },
    secondaryMetric: {
      label: "Quality Retained",
      value: `${speedBest.judgePct.toFixed(1)}%`,
      detail: "Judge approval maintained",
    },
    row: speedBest,
  });
}

if (matchBest) {
  CHAMPION_PICKS.push({
    id: "match",
    tabLabel: "Best Thai match",
    categoryTitle: "Best Ground-Truth Alignment",
    badge: "Top Match",
    storyTitle: "Most human answers contained in full.",
    storyText: `Demonstrated the highest gold-answer containment, scoring ${matchBest.mTh.toFixed(
      3
    )} M-score and ${matchBest.f1Th.toFixed(3)} F1.`,
    icon: "target",
    accent: "var(--brand-text)",
    primaryMetric: {
      label: "Thai M-Score",
      value: matchBest.mTh.toFixed(3),
      detail: "Gold answer contained in the response",
    },
    secondaryMetric: {
      label: "Thai F1-Score",
      value: matchBest.f1Th.toFixed(3),
      detail: "Precision & recall harmonic",
    },
    row: matchBest,
  });
}

/** "2026-10-21T02:15:19.346744" -> "Oct 21, 2026"; empty when no runs. */
export const LATEST_RUN_LABEL = (() => {
  const latest = BENCHMARK_ROWS.map((row) => row.runDate)
    .filter(Boolean)
    .sort()
    .pop();
  if (!latest) return "";
  return new Date(latest).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
})();
