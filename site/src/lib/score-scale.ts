/** Five-step sequential tint for scores, scaled to the observed range. */
export type ScoreBand = 1 | 2 | 3 | 4 | 5;

export const SCORE_BAND_ORDER: ScoreBand[] = [1, 2, 3, 4, 5];

/** Static classes so Tailwind can see every band. */
export const SCORE_BAND_CLASSES: Record<ScoreBand, string> = {
  1: "bg-[var(--score-band-1)]",
  2: "bg-[var(--score-band-2)]",
  3: "bg-[var(--score-band-3)]",
  4: "bg-[var(--score-band-4)]",
  5: "bg-[var(--score-band-5)]",
};

/**
 * Map a value onto 1–5 across [min, max]. Ties always land in the same band;
 * an empty or flat field collapses to the middle band instead of dividing by 0.
 */
export function scoreBand(value: number, min: number, max: number): ScoreBand {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return 3;
  }
  if (max <= min) return 3;
  const ratio = (value - min) / (max - min);
  const band = Math.floor(ratio * 5) + 1;
  return Math.min(5, Math.max(1, band)) as ScoreBand;
}
