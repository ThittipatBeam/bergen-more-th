import type { MetricFamily } from "@/types/metrics";

/**
 * One accent hue per question the metric answers. Values are AA-checked CSS
 * custom properties (see globals.css): never raw brand accents as text.
 */
export const FAMILY_COLORS: Record<
  MetricFamily,
  { fg: string; bg: string; label: string }
> = {
  quality: {
    fg: "var(--brand-text)",
    bg: "var(--surface-brand)",
    label: "Quality",
  },
  containment: {
    fg: "var(--metric-containment)",
    bg: "var(--metric-containment-bg)",
    label: "Exactness",
  },
  overlap: {
    fg: "var(--metric-overlap)",
    bg: "var(--metric-overlap-bg)",
    label: "Word overlap",
  },
  speed: {
    fg: "var(--perf-text)",
    bg: "var(--perf-bg)",
    label: "Speed",
  },
};
