/** Medal classes for leaderboard ranks 1–3. Colors live in the theme-aware
 *  --medal-* tokens (globals.css); always redundant with the rank numeral. */
export const RANK_MEDAL_CLASSES: Record<number, string> = {
  1: "text-[var(--medal-gold)]", // gold
  2: "text-[var(--medal-silver)]", // silver
  3: "text-[var(--medal-bronze)]", // bronze
};
