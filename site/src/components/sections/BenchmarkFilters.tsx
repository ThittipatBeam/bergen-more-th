"use client";

import type { ReactNode } from "react";
import { BrandIcon } from "@/components/ui/BrandIcon";

export type RerankerFilter = "all" | "yes" | "no";

interface BenchmarkFiltersProps {
  generators: string[];
  generator: string;
  onGenerator: (value: string) => void;
  reranker: RerankerFilter;
  onReranker: (value: RerankerFilter) => void;
}

const RERANKER_OPTIONS: { value: RerankerFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "yes", label: "Reranked" },
  { value: "no", label: "No reranker" },
];

function Chip({
  active,
  label,
  onPress,
  icon,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onPress}
      className={`min-h-[44px] px-4 rounded-full border text-xs font-mono font-medium transition-colors cursor-pointer inline-flex items-center gap-2 ${
        active
          ? "bg-[#0795CF] border-[#0795CF] text-white"
          : "border-[var(--border-default)] bg-[var(--background-primary)] text-[var(--text-secondary)] hover:border-[#73B7DC] hover:text-[var(--text-primary)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function BenchmarkFilters({
  generators,
  generator,
  onGenerator,
  reranker,
  onReranker,
}: BenchmarkFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] w-full sm:w-auto">
          Generator
        </span>
        <Chip
          active={generator === "all"}
          label="All"
          onPress={() => onGenerator("all")}
        />
        {generators.map((gen) => (
          <Chip
            key={gen}
            active={generator === gen}
            label={gen}
            icon={<BrandIcon name={gen} size={16} />}
            onPress={() => onGenerator(gen)}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] w-full sm:w-auto">
          Reranker
        </span>
        {RERANKER_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            active={reranker === option.value}
            label={option.label}
            onPress={() => onReranker(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
