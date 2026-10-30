"use client";

import type { ChampionPick } from "@/types/benchmark";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";


/** One pipeline stage: big icon tile, bold model name, small stage label. */
function StageRow({
  model,
  label,
  blank = false,
}: {
  model: string;
  label: string;
  /** True when the stage is skipped: empty tile, muted name. */
  blank?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--border-default)]/60 bg-[var(--background-primary)] px-3 py-2.5">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-lg ${
          blank
            ? "border border-dashed border-[var(--border-default)] font-mono text-sm text-[var(--text-muted)]"
            : "bg-[var(--surface-brand)] text-[var(--brand-text)]"
        }`}
      >
        {blank ? "—" : <BrandIcon name={model} size={20} />}
      </span>
      <div className="flex min-w-0 flex-col">
        <span
          className={`truncate font-sans text-sm font-bold ${
            blank ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"
          }`}
          title={model}
        >
          {model}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </span>
      </div>
    </div>
  );
}

function CategoryIcon({
  icon,
  accent,
}: {
  icon: ChampionPick["icon"];
  accent: string;
}) {
  if (icon === "trophy") {
    return (
      <svg
        className="w-4 h-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34c3.48-.57 6-3.56 6-7.16V4H4v6.5c0 3.6 2.52 6.59 6 7.16Z" />
      </svg>
    );
  }
  if (icon === "bolt") {
    return (
      <svg
        className="w-4 h-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    );
  }
  return (
    <svg
      className="w-4 h-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke={accent}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

interface StackedFolderCardProps {
  pick: ChampionPick;
  level: number;
  isActive: boolean;
  onSelect: () => void;
}

export function StackedFolderCard({
  pick,
  level,
  isActive,
  onSelect,
}: StackedFolderCardProps) {
  const { language } = useLanguage();
  const c = I18N[language].champions;
  const { row } = pick;
  const translateY = level * 44;

  return (
    <article
      style={{
        transform: `translateY(${translateY}px)`,
        zIndex: level + 1,
      }}
      className={`absolute inset-x-0 top-0 h-[432px] sm:h-[420px] rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
        isActive
          ? "border-[var(--border-default)] bg-[var(--background-primary)] card-shadow"
          : "border-[var(--border-default)]/90 bg-[var(--background-subtle)] hover:border-[var(--brand-sky-light)] cursor-pointer shadow-sm"
      }`}
    >
      {/* Tab Strip: 44px+ tap target */}
      <div className="relative flex items-center justify-between h-12 px-5 border-b border-[var(--border-default)]/50 bg-[var(--background-subtle)]/60">
        <div className="flex items-center gap-2.5">
          <CategoryIcon icon={pick.icon} accent={pick.accent} />
          <span className="text-xs sm:text-sm font-mono font-semibold tracking-wide text-[var(--text-primary)]">
            {pick.tabLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-[var(--border-default)] bg-[var(--background-subtle)] text-[var(--text-secondary)] font-semibold">
            {pick.badge}
          </span>
        </div>

        {!isActive && (
          <button
            type="button"
            onClick={onSelect}
            aria-label={`${language === "TH" ? "แสดง" : "Show"} ${pick.categoryTitle}`}
            className="champion-hit-area absolute inset-0 z-10 h-full w-full cursor-pointer rounded-t-2xl bg-transparent"
          />
        )}
      </div>

      {/* Card Body: fades in when active */}
      <div
        className={`px-4 sm:px-6 pt-3 pb-4 flex flex-col justify-between h-[calc(100%-48px)] transition-all duration-300 ${
          isActive
            ? "opacity-100 visible translate-y-0 delay-100"
            : "opacity-0 invisible translate-y-2 pointer-events-none"
        }`}
      >
        {/* 1. Hero Focal Metric */}
        <div className="flex items-start justify-between gap-3 pt-0.5">
          <div>
            <div className="flex items-baseline gap-2">
              <span
                style={{ color: pick.accent }}
                className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight"
              >
                {pick.primaryMetric.value}
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                {pick.primaryMetric.label}
              </span>
            </div>
            {pick.primaryMetric.detail && (
              <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                {pick.primaryMetric.detail}
              </p>
            )}
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
              {pick.secondaryMetric.label}
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-[var(--text-primary)]">
              {pick.secondaryMetric.value}
            </span>
          </div>
        </div>

        {/* 2. RAG Pipeline (Clear 3-Stage Architecture) */}
        <div className="rounded-xl border border-[var(--border-default)]/80 bg-[var(--background-subtle)]/70 p-2.5 sm:p-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] mb-2 font-semibold">
            <span className="flex items-center gap-1.5">
              {c.ragPipelineArch}
            </span>
            <span className="font-mono text-sm font-bold text-[var(--text-primary)]">
              #{row.rank}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Stage 1: Retrieval */}
            <StageRow model={row.retriever} label={c.stageRetrieval} />

            {/* Stage 2: Reranker */}
            <StageRow
              model={row.reranker ?? c.noneDirectDense}
              label={c.stageReranker}
              blank={!row.reranker}
            />

            {/* Stage 3: Generator */}
            <StageRow model={row.generator} label={c.stageGenerator} />
          </div>
        </div>

        {/* 3. Footer */}
        <div className="flex items-center justify-end text-xs font-mono pt-0.5 text-[var(--text-muted)]">
          <a
            href="#leaderboard"
            className="shrink-0 text-xs font-mono font-semibold text-[var(--brand-text)] hover:text-[var(--brand-cta-hover)] transition-colors min-h-[44px] inline-flex items-center"
          >
            {c.fullResults}
          </a>
        </div>
      </div>
    </article>
  );
}