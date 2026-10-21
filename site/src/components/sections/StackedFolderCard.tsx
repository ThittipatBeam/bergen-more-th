import type { ChampionPick } from "@/types/benchmark";
import { BrandIcon } from "@/components/ui/BrandIcon";

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
  const { row } = pick;
  const translateY = level * 44;

  return (
    <article
      style={{
        transform: `translateY(${translateY}px)`,
        zIndex: level + 1,
      }}
      className={`absolute inset-x-0 top-0 h-[380px] sm:h-[364px] rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
        isActive
          ? "border-[var(--border-default)] bg-[var(--background-primary)] shadow-[0_20px_48px_-16px_rgba(7,149,207,0.18)] dark:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.85)]"
          : "border-[var(--border-default)]/90 bg-[var(--background-subtle)] hover:border-[#73B7DC] cursor-pointer shadow-sm"
      }`}
    >
      {/* Tab Strip: 44px tap target */}
      <div className="relative flex items-center justify-between h-11 px-5 border-b border-[var(--border-default)]/50 bg-[var(--background-subtle)]/60">
        <div className="flex items-center gap-2.5">
          <CategoryIcon icon={pick.icon} accent={pick.accent} />
          <span className="text-xs sm:text-sm font-mono font-semibold tracking-wide text-[var(--text-primary)]">
            {pick.tabLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            style={{
              borderColor: `${pick.accent}55`,
              backgroundColor: `${pick.accent}15`,
              color: pick.accent,
            }}
            className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border font-semibold"
          >
            {pick.badge}
          </span>
        </div>

        {!isActive && (
          <button
            type="button"
            onClick={onSelect}
            aria-label={`Show ${pick.categoryTitle}`}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        )}
      </div>

      {/* Card Body: fades in when active */}
      <div
        className={`px-4 sm:px-6 pt-3 pb-4 flex flex-col justify-between h-[calc(100%-44px)] transition-all duration-300 ${
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
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                {pick.primaryMetric.label}
              </span>
            </div>
            <p className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
              {pick.primaryMetric.detail}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
              {pick.secondaryMetric.label}
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-[var(--text-primary)]">
              {pick.secondaryMetric.value}
            </span>
          </div>
        </div>

        {/* 2. RAG Pipeline (Clear 3-Stage Architecture) */}
        <div className="rounded-xl border border-[var(--border-default)]/80 bg-[var(--background-subtle)]/70 p-2.5 sm:p-3">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-2 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0795CF]" />
              RAG Pipeline Architecture
            </span>
            <span className="text-[var(--text-secondary)] font-mono">
              Rank #{row.rank}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Stage 1: Retrieval */}
            <div className="flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg bg-[var(--background-primary)] border border-[var(--border-default)]/60 text-xs font-mono">
              <span className="text-[10px] uppercase font-semibold text-[#0795CF] flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0795CF]" />
                1. Retrieval
              </span>
              <div className="flex items-center gap-1.5 min-w-0 font-bold text-[var(--text-primary)]">
                <BrandIcon name={row.retriever} size={15} />
                <span className="truncate" title={row.retriever}>
                  {row.retriever}
                </span>
              </div>
            </div>

            {/* Stage 2: Reranker */}
            <div className="flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg bg-[var(--background-primary)] border border-[var(--border-default)]/60 text-xs font-mono">
              <span className="text-[10px] uppercase font-semibold text-[#01A9B1] flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#01A9B1]" />
                2. Reranker
              </span>
              <div className="flex items-center gap-1.5 min-w-0 font-bold text-[var(--text-primary)]">
                <BrandIcon name={row.reranker} size={15} />
                <span className="truncate" title={row.reranker ?? "None"}>
                  {row.reranker ?? "None (Direct Dense)"}
                </span>
              </div>
            </div>

            {/* Stage 3: Generator */}
            <div className="flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg bg-[var(--background-primary)] border border-[var(--border-default)]/60 text-xs font-mono">
              <span className="text-[10px] uppercase font-semibold text-[#00A0BE] flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A0BE]" />
                3. Generator
              </span>
              <div className="flex items-center gap-1.5 min-w-0 font-bold text-[var(--text-primary)]">
                <BrandIcon name={row.generator} size={15} />
                <span className="truncate" title={row.generator}>
                  {row.generator}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Footer */}
        <div className="flex items-center justify-between text-xs font-mono pt-0.5 text-[var(--text-muted)]">
          <span className="text-[11px] truncate text-[var(--text-muted)]">
            Corpus: Thai Wikipedia QA
          </span>

          <a
            href="#leaderboard"
            className="shrink-0 text-xs font-mono font-semibold text-[#0795CF] hover:text-[#006B91] transition-colors min-h-[44px] inline-flex items-center"
          >
            Full results &darr;
          </a>
        </div>
      </div>
    </article>
  );
}