"use client";

import { MathFormula } from "@/components/ui/MathFormula";
import { MetricIcon } from "@/components/ui/MetricIcon";
import { FAMILY_COLORS } from "@/lib/metrics-styles";
import type { MetricDefinition } from "@/types/metrics";
import { MetricDisclosure } from "./MetricDisclosure";
import { useLanguage } from "@/hooks/use-language";

interface MetricRowProps {
  metric: MetricDefinition;
  /** Data-driven line replacing the static example when the board has runs. */
  example?: string;
}

/**
 * One metric as a table row: what it asks, how it scores, whether words are
 * segmented with PyThaiNLP. The formula, symbol legend and notes open
 * underneath via "Show the math".
 */
export function MetricRow({ metric, example }: MetricRowProps) {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const color = FAMILY_COLORS[metric.family];
  const higher = metric.direction === "higher";

  return (
    <article className="flex flex-col gap-3 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)] sm:items-start sm:gap-6">
        {/* Metric */}
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-xl"
            style={{ backgroundColor: color.bg, color: color.fg }}
          >
            <MetricIcon name={metric.icon} className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 className="font-sans text-base font-bold text-[var(--text-primary)]">
              {metric.name}
            </h3>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {isTh
                ? higher
                  ? "ยิ่งสูงยิ่งดี ↑"
                  : "ยิ่งต่ำยิ่งดี ↓"
                : higher
                  ? "Higher ↑"
                  : "Lower ↓"}
            </span>
            {(metric.id === "judge" || metric.id === "mth") && (
              <span className="w-fit rounded-full bg-[var(--surface-brand)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--brand-text)]">
                {isTh ? "ใช้ใน Overall" : "In Overall"}
              </span>
            )}
          </div>
        </div>

        {/* What it asks */}
        <p className="font-sans text-base font-semibold leading-snug text-[var(--text-primary)]">
          {metric.simple.question}
        </p>

        {/* How it scores */}
        <div className="flex flex-col gap-1">
          <p className="font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
            {metric.simple.explanation}
          </p>
          <p className="font-sans text-sm leading-relaxed text-[var(--text-muted)]">
            {example ?? metric.simple.example}
          </p>
        </div>

      </div>

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
