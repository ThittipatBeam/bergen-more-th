/** Medal classes for leaderboard ranks 1–3. Colors live in the theme-aware
 *  --medal-* tokens (globals.css); always redundant with the rank numeral. */
export const RANK_MEDAL_CLASSES: Record<number, string> = {
  1: "text-[var(--medal-gold)]", // gold
  2: "text-[var(--medal-silver)]", // silver
  3: "text-[var(--medal-bronze)]", // bronze
};

/** Subtle row wash for the podium; never the only rank cue. */
export const RANK_ROW_CLASSES: Record<number, string> = {
  1: "bg-[var(--rank-gold-bg)]",
  2: "bg-[var(--rank-silver-bg)]",
  3: "bg-[var(--rank-bronze-bg)]",
};
