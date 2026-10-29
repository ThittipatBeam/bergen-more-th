"use client";

import { MathFormula } from "@/components/ui/MathFormula";
import { MetricIcon } from "@/components/ui/MetricIcon";
import { FAMILY_COLORS } from "@/lib/metrics-styles";
import type { MetricDefinition } from "@/types/metrics";
import { MetricDisclosure } from "./MetricDisclosure";
import { useLanguage } from "@/hooks/use-language";

interface MetricCardProps {
  metric: MetricDefinition;
  /** Data-driven line replacing the static example when the board has runs. */
  example?: string;
}

/**
 * One metric: icon, name, direction, question, one sentence, one example. The
 * formula, symbol legend and notes open underneath. Entries are divided rows
 * inside the chapter's card, so nothing nests.
 */
export function MetricCard({ metric, example }: MetricCardProps) {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const color = FAMILY_COLORS[metric.family];
  const higher = metric.direction === "higher";

  return (
    <article className="flex flex-col gap-4 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 className="flex min-w-0 items-center gap-3 font-sans text-lg font-bold text-[var(--text-primary)]">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-xl"
            style={{ backgroundColor: color.bg, color: color.fg }}
          >
            <MetricIcon name={metric.icon} className="size-[22px]" />
          </span>
          <span className="min-w-0">{metric.name}</span>
        </h3>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 font-mono text-xs font-semibold"
          style={{ backgroundColor: color.bg, color: color.fg }}
        >
          {isTh ? (higher ? "ยิ่งสูงยิ่งดี" : "ยิ่งต่ำยิ่งดี") : higher ? "Higher" : "Lower"}
          <span aria-hidden="true">{higher ? " ↑" : " ↓"}</span>
          <span className="sr-only"> is better</span>
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="max-w-[62ch] font-sans text-lg font-semibold leading-snug text-[var(--text-primary)]">
          {metric.simple.question}
        </p>
        <p className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
          {metric.simple.explanation}
        </p>
      </div>

      <p className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-muted)]">
        {example ?? metric.simple.example}
      </p>

      <MetricDisclosure label={metric.name}>
        <p className="font-sans text-base leading-7 text-[var(--text-secondary)]">
          {metric.technical.reading}
        </p>

        <MathFormula
          tex={metric.technical.formula.tex}
          label={`${metric.name} formula`}
          className="rounded-xl border border-[var(--border-default)] bg-[var(--background-subtle)] px-3 py-1"
        />

        <dl className="flex flex-col gap-2">
          {metric.technical.formula.symbols.map((symbol) => (
            <div key={symbol.symbol} className="flex items-baseline gap-3">
              <dt className="w-20 shrink-0 font-mono text-xs font-bold text-[var(--text-primary)]">
                {symbol.symbol}
              </dt>
              <dd className="font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
                {symbol.meaning}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="flex list-disc flex-col gap-1.5 pl-4 font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
          {metric.technical.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <span className="font-mono text-xs text-[var(--text-muted)]">
          {metric.technical.key}
        </span>
      </MetricDisclosure>
    </article>
  );
}
