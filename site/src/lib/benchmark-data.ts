import rawExperiments from "./experiments-data.json";
import type { Language } from "@/hooks/use-language";
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
export function getChampionPicks(lang: Language = "EN"): ChampionPick[] {
  const isTh = lang === "TH";
  const picks: ChampionPick[] = [];

  if (qualityBest) {
    picks.push({
      id: "quality",
      tabLabel: isTh ? "คะแนนรวมสูงสุด" : "Best overall",
      categoryTitle: isTh ? "คะแนนรวมสูงสุด" : "Top overall score",
      badge: isTh ? "อันดับ 1 รวม" : "#1 Overall",
      storyTitle: isTh
        ? `คะแนนรวมสูงสุดบนตาราง: ${qualityBest.q.toFixed(1)} จาก 100`
        : `Top overall score: ${qualityBest.q.toFixed(1)} of 100.`,
      storyText: isTh
        ? `${qualityBest.generator} ร่วมกับ ${qualityBest.retriever} ทำคะแนนรวมได้สมดุลที่สุด ทั้งคะแนนจาก judge ความตรงกับเฉลย และสัดส่วนคำไทยที่ตรงกัน`
        : `${qualityBest.generator} paired with ${qualityBest.retriever} achieved the most balanced scores across the judge, exact match, and Thai word overlap.`,
      icon: "trophy",
      accent: "var(--brand-text)",
      primaryMetric: {
        label: isTh ? "Overall Score" : "Overall Score",
        value: qualityBest.q.toFixed(1),
        detail: isTh
          ? "45% Judge · 20% Match TH · 20% F1 · 15% EM"
          : "45% judge · 20% Match TH · 20% F1 · 15% EM",
      },
      secondaryMetric: {
        label: isTh ? "คะแนน LLM Judge" : "LLM Judge Score",
        value: `${qualityBest.judgePct.toFixed(1)}%`,
        detail: isTh
          ? `ตัดสินโดย ${qualityBest.judgeName ?? "Kimi-K3"}${
              qualityBest.judgeN ? ` · n=${qualityBest.judgeN}` : ""
            }`
          : `Scored by ${qualityBest.judgeName ?? "Kimi-K3"}${
              qualityBest.judgeN ? ` · n=${qualityBest.judgeN}` : ""
            }`,
      },
      row: qualityBest,
    });
  }

  if (speedBest) {
    picks.push({
      id: "speed",
      tabLabel: isTh ? "สร้างคำตอบเร็วที่สุด" : "Fastest generation",
      categoryTitle: isTh ? "สร้างคำตอบเร็วที่สุด" : "Fastest generation",
      badge: isTh ? "เร็วที่สุด" : "Top Speed",
      storyTitle: isTh
        ? "สร้างคำตอบครบ 500 ข้อได้เร็วที่สุด"
        : "Fastest writing time on the 500-question sample.",
      storyText: isTh
        ? `${speedBest.generator} สร้างคำตอบครบ 500 ข้อในเวลา ${formatClock(
            speedBest.genSeconds
          )} โดยได้คะแนนจาก judge อยู่ที่ ${speedBest.judgePct.toFixed(1)}%`
        : `${speedBest.generator} generated all 500 answers in ${formatClock(
            speedBest.genSeconds
          )}, while scoring ${speedBest.judgePct.toFixed(1)}% on the judge metric.`,
      icon: "bolt",
      accent: "var(--perf-text)",
      primaryMetric: {
        label: isTh ? "เวลาสร้างคำตอบ" : "Generation Time",
        value: formatClock(speedBest.genSeconds),
        detail: isTh
          ? "เฉพาะเวลาเขียนข้อความ · ไม่รวมค้นหาเอกสารและตรวจคะแนน"
          : "Generation only · excludes retrieval and scoring",
      },
      secondaryMetric: {
        label: isTh ? "คะแนน Judge" : "Judge Score",
        value: `${speedBest.judgePct.toFixed(1)}%`,
        detail: isTh ? "สัดส่วนคำตอบที่ judge ตรวจว่าถูก" : "Answers marked correct by judge",
      },
      row: speedBest,
    });
  }

  if (matchBest) {
    picks.push({
      id: "match",
      tabLabel: isTh ? "ตรงคำตอบเฉลยสูงสุด" : "Best reference match",
      categoryTitle: isTh ? "ตรงกับคำตอบเฉลยสูงสุด" : "Best reference match",
      badge: isTh ? "ตรงเฉลยสูงสุด" : "Top Match",
      storyTitle: isTh
        ? "มีข้อความเฉลยปรากฏในคำตอบครบถ้วนที่สุด"
        : "Most complete reference answers contained in output.",
      storyText: isTh
        ? `มีข้อความเฉลยปรากฏครบถ้วนในคำตอบมากที่สุด โดยทำคะแนน Match TH ได้ ${matchBest.mTh.toFixed(
            3
          )} และ F1 ได้ ${matchBest.f1Th.toFixed(3)}`
        : `Included the highest share of complete reference answers, scoring ${matchBest.mTh.toFixed(
            3
          )} on Match TH and ${matchBest.f1Th.toFixed(3)} on F1.`,
      icon: "target",
      accent: "var(--brand-text)",
      primaryMetric: {
        label: isTh ? "Thai M-Score" : "Thai M-Score",
        value: matchBest.mTh.toFixed(3),
        detail: isTh
          ? "มีข้อความเฉลยครบถ้วนในคำตอบ"
          : "Gold answer contained in the response",
      },
      secondaryMetric: {
        label: isTh ? "Thai F1-Score" : "Thai F1-Score",
        value: matchBest.f1Th.toFixed(3),
        detail: isTh
          ? "ค่าเฉลี่ยฮาร์มอนิกของ Precision และ Recall"
          : "Harmonic mean of precision and recall",
      },
      row: matchBest,
    });
  }

  return picks;
}

export const CHAMPION_PICKS: ChampionPick[] = getChampionPicks("EN");

export function getLatestRunLabel(lang: Language = "EN"): string {
  const latest = BENCHMARK_ROWS.map((row) => row.runDate)
    .filter(Boolean)
    .sort()
    .pop();
  if (!latest) return "";
  return new Date(latest).toLocaleDateString(lang === "TH" ? "th-TH" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "2026-10-21T02:15:19.346744" -> "Oct 21, 2026"; empty when no runs. */
export const LATEST_RUN_LABEL = getLatestRunLabel("EN");
