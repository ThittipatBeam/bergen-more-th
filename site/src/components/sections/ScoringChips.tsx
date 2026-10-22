import { SCORING_CHIPS } from "@/lib/methodology-data";

/** Three settings that make the judge deterministic, in plain language. */
export function ScoringChips() {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {SCORING_CHIPS.map((chip) => (
        <li
          key={chip.label}
          className="flex flex-col gap-2 rounded-2xl bg-[var(--background-subtle)] px-5 py-4"
        >
          <span className="font-mono text-xs font-bold text-[var(--brand-text)]">
            {chip.label}
          </span>
          <span className="font-sans text-base leading-relaxed text-[var(--text-secondary)]">
            {chip.body}
          </span>
        </li>
      ))}
    </ul>
  );
}
