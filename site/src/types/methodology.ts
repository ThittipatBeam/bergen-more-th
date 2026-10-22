import type { MetricIconName } from "@/types/metrics";

/** One numbered chapter of the methodology story. */
export interface MethodologyChapterMeta {
  id: string;
  number: string;
  title: string;
  intro: string;
  icon: MetricIconName;
  /** AA-checked CSS custom properties, same shape as the metrics chapters. */
  accent: { fg: string; bg: string };
}

/** A pillar block that must stay word-for-word in the page. */
export interface MethodologyBlock {
  badge: string;
  title: string;
  description: string;
  details: readonly string[];
}

/** One stage of the pipeline a leaderboard row runs. */
export interface PipelineStage {
  label: string;
  value: string;
  note: string;
}

/** One step of the dataset-construction story. */
export interface DatasetStep {
  title: string;
  body: string;
  meta: string;
  /** External source credited under the step, if any. */
  source?: { href: string; label: string };
}

/** One "why this setting" tile under the scoring protocol. */
export interface ScoringChip {
  label: string;
  body: string;
}
