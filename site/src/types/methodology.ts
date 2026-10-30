import type { MetricIconName } from "@/types/metrics";

/** One numbered chapter of the methodology story. */
export interface MethodologyChapterMeta {
  id: string;
  number: string;
  title: string;
  intro?: string;
  icon: MetricIconName;
  /** AA-checked CSS custom properties, same shape as the metrics chapters. */
  accent: { fg: string; bg: string };
}

/** One stage of the pipeline a leaderboard row runs. */
export interface PipelineStage {
  label: string;
  value: string;
  note: string;
}

/** One step of the dataset-construction strip. */
export interface DatasetStep {
  title: string;
  /** One plain sentence, shown in the expanded step panel. */
  line: string;
  /** Mono detail line: the concrete facts, e.g. "2 pairs per article · answers 2-10 words". */
  meta: string;
}
