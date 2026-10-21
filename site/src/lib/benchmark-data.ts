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

const toRow = (exp: ExperimentRecord): BenchmarkRow | null => {
  const metrics = exp.metrics ?? {};
  const retriever = exp.retriever?.model_name;
  const generator = exp.generator?.model_name;
  const judgePct = metrics.LLMeval_judge_pct;
  if (!retriever || !generator || typeof judgePct !== "number") return null;
  return {
    id: exp.experiment_id,
    rank: 0,
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
};

/** Valid experiments (junk/null records dropped), ranked by judge score desc. */
export const BENCHMARK_ROWS: BenchmarkRow[] = (
  rawExperiments as unknown as ExperimentRecord[]
)
  .map(toRow)
  .filter((row): row is BenchmarkRow => row !== null)
  .sort((a, b) => b.judgePct - a.judgePct || b.mTh - a.mTh)
  .map((row, index) => ({ ...row, rank: index + 1 }));

const firstWithJudge = BENCHMARK_ROWS.find((row) => row.judgeName);

export const JUDGE_NAME = firstWithJudge?.judgeName ?? "KIMI-K3";
export const JUDGE_N = firstWithJudge?.judgeN ?? 500;

const byBest = (pick: (row: BenchmarkRow) => number) =>
  [...BENCHMARK_ROWS].sort((a, b) => pick(b) - pick(a))[0];

const judgeBest = byBest((row) => row.judgePct);
const speedBest = byBest((row) =>
  row.genSeconds === null ? Number.NEGATIVE_INFINITY : -row.genSeconds
);
const matchBest = byBest((row) => row.mTh);

/** Category champions shown in the hero stacked card deck. */
export const CHAMPION_PICKS: ChampionPick[] = [];

if (judgeBest) {
  CHAMPION_PICKS.push({
    id: "judge",
    tabLabel: "Highest score",
    categoryTitle: "Highest Judge Approval",
    badge: "#1 Overall",
    storyTitle: `Top-rated Thai answers with ${judgeBest.judgePct.toFixed(1)}% judge approval.`,
    storyText: `In this evaluation, ${judgeBest.generator} paired with ${judgeBest.retriever} achieved the highest response quality rated by ${judgeBest.judgeName ?? "Kimi-K3"}.`,
    icon: "trophy",
    accent: "var(--brand-text)",
    primaryMetric: {
      label: "LLM Judge Score",
      value: `${judgeBest.judgePct.toFixed(1)}%`,
      detail: `Judged by ${judgeBest.judgeName ?? "Kimi-K3"}${
        judgeBest.judgeN ? ` · n=${judgeBest.judgeN}` : ""
      }`,
    },
    secondaryMetric: {
      label: "Thai Text Match",
      value: judgeBest.mTh.toFixed(3),
      detail: "M (TH) lexical overlap",
    },
    row: judgeBest,
  });
}

if (speedBest) {
  CHAMPION_PICKS.push({
    id: "speed",
    tabLabel: "Fastest delivery",
    categoryTitle: "Fastest Pipeline Throughput",
    badge: "Top Speed",
    storyTitle: "Sub-minute retrieval and generation throughput.",
    storyText: `${speedBest.generator} finished the full Thai evaluation set in ${formatClock(
      speedBest.genSeconds
    )}, maintaining a competitive ${speedBest.judgePct.toFixed(1)}% judge score.`,
    icon: "bolt",
    accent: "var(--perf-text)",
    primaryMetric: {
      label: "Generation Time",
      value: formatClock(speedBest.genSeconds),
      detail: "End-to-end pipeline latency",
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
    badge: "Top Precision",
    storyTitle: "Closest lexical alignment with Thai human answers.",
    storyText: `Demonstrated the highest token agreement with reference texts, scoring ${matchBest.mTh.toFixed(
      3
    )} M-score and ${matchBest.f1Th.toFixed(3)} F1.`,
    icon: "target",
    accent: "var(--brand-text)",
    primaryMetric: {
      label: "Thai M-Score",
      value: matchBest.mTh.toFixed(3),
      detail: "Exact token & unigram match",
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
