import rawExperiments from "./experiments-data.json";
import type {
  ExperimentRecord,
  NitiBenchRow,
  NitiMode,
} from "@/types/benchmark";

/**
 * NitiBench+ (Thai legal) board data. A run belongs here when its query
 * dataset is the NitiBenchPlusQA processor, and it is shown only when the
 * two NitiBench scorers actually ran: rubric judge + citation F1.
 */

const NITI_QUERY_SUFFIX = "NitiBenchPlusQA";

export const isNitiExperiment = (exp: ExperimentRecord): boolean =>
  (exp.dataset?.query?.target ?? "").endsWith(NITI_QUERY_SUFFIX);

/** No retriever = parametric (answers from memory); oracle = gold-cited. */
export const nitiModeOf = (exp: ExperimentRecord): NitiMode => {
  const model = exp.retriever?.model_name ?? null;
  if (!model) return "Parametric";
  if (model === "oracle_provenance") return "Gold-cited";
  return "RAG";
};

const asNum = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

/** Metrics land as 0-1 fractions; already-percent values pass through. */
const pct = (v: unknown): number | null => {
  const n = asNum(v);
  if (n === null) return null;
  return n <= 1 ? n * 100 : n;
};

/** "00:10:02.08" -> 602.08 seconds; null when unparseable. */
const parseClock = (clock: string): number | null => {
  const match = /^(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/.exec(clock);
  if (!match) return null;
  return (
    Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])
  );
};

/** ranking_metrics keys recall on generation_top_k (recall_5); accept any. */
const recallFrom = (
  ranking: Record<string, number> | null | undefined
): number | null => {
  if (!ranking) return null;
  for (const [key, value] of Object.entries(ranking)) {
    if (key.toLowerCase().startsWith("recall")) return pct(value);
  }
  return null;
};

const pAt1From = (
  ranking: Record<string, number> | null | undefined
): number | null => pct(ranking?.P_1);

const toNitiRow = (exp: ExperimentRecord): NitiBenchRow | null => {
  if (!isNitiExperiment(exp)) return null;
  const metrics = exp.metrics ?? {};
  const rubricBar = asNum(metrics.niti_rubric_bar_standard);
  const citationF1 = pct(metrics.niti_citation_f1);
  const generator = exp.generator?.model_name ?? null;
  if (rubricBar === null || citationF1 === null || !generator) return null;
  return {
    id: exp.experiment_id,
    rank: 0,
    tieCount: 1,
    mode: nitiModeOf(exp),
    retriever: exp.retriever?.model_name ?? null,
    reranker: exp.reranker?.model_name ?? null,
    generator,
    runDate: exp.run_date,
    rubricBar,
    rubricMicro: asNum(metrics.niti_rubric_micro) ?? rubricBar,
    unknownRate: asNum(metrics.niti_rubric_unknown_rate) ?? 0,
    judgeModel:
      typeof metrics.niti_rubric_judge === "string"
        ? metrics.niti_rubric_judge
        : null,
    citationF1,
    citationF1Macro: pct(metrics.niti_citation_f1_macro) ?? citationF1,
    citationPrecision: pct(metrics.niti_citation_precision) ?? 0,
    citationRecall: pct(metrics.niti_citation_recall) ?? 0,
    hallucinated: asNum(metrics.niti_citation_hallucinated),
    recallAtK: recallFrom(exp.ranking_metrics),
    pAt1: pAt1From(exp.ranking_metrics),
    nCases: asNum(metrics.niti_rubric_n_cases),
    genSeconds: exp.generation_time ? parseClock(exp.generation_time) : null,
  };
};

/** Ranked by the official Bar-standard rubric score; citation F1 breaks ties. */
const sortedRows = (rawExperiments as unknown as ExperimentRecord[])
  .map(toNitiRow)
  .filter((row): row is NitiBenchRow => row !== null)
  .sort(
    (a, b) =>
      b.rubricBar - a.rubricBar ||
      b.citationF1 - a.citationF1 ||
      b.runDate.localeCompare(a.runDate)
  );

/** Competition ranking on the displayed (two-decimal) score, so visual ties
 *  never receive different ranks. */
let lastDisplayed: number | null = null;
let lastRank = 0;
const rankedRows = sortedRows.map((row, index) => {
  const displayed = Math.round(row.rubricBar * 100);
  if (displayed !== lastDisplayed) {
    lastRank = index + 1;
    lastDisplayed = displayed;
  }
  return { ...row, rank: lastRank };
});

const tieCounts = new Map<number, number>();
for (const row of rankedRows) {
  tieCounts.set(row.rank, (tieCounts.get(row.rank) ?? 0) + 1);
}

export const NITI_ROWS: NitiBenchRow[] = rankedRows.map((row) => ({
  ...row,
  tieCount: tieCounts.get(row.rank) ?? 1,
}));
