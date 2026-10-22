"use client";

import { getScoringChips } from "@/lib/methodology-data";
import { useLanguage } from "@/hooks/use-language";

/** Three settings that make the judge deterministic, in plain language. */
export function ScoringChips() {
  const { language } = useLanguage();
  const chips = getScoringChips(language);

  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {chips.map((chip) => (
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
