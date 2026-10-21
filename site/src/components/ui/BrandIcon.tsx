import type { ReactNode } from "react";
import { BAAI, DeepSeek, Kimi, Qwen } from "@lobehub/icons";

/** Model-name matchers -> brand icon (first match wins). */
const RULES: ReadonlyArray<{
  test: (normalized: string) => boolean;
  render: (size: number) => ReactNode;
}> = [
  { test: (n) => n.includes("deepseek"), render: (s) => <DeepSeek.Color size={s} /> },
  { test: (n) => n.includes("qwen"), render: (s) => <Qwen.Color size={s} /> },
  {
    test: (n) => n.includes("kimi") || n.includes("moonshot"),
    render: (s) => (
      <span className="inline-flex items-center text-[#1783FF] dark:text-[#38bdf8]">
        <Kimi size={s} />
      </span>
    ),
  },
  { test: (n) => n.includes("bge") || n.includes("baai"), render: (s) => <BAAI size={s} /> },
];

/**
 * AI brand logo for a model name (e.g. "DEEPSEEK-V4.1F", "BAAI/bge-m3").
 * Falls back to an initial tile for unknown names; empty name renders a dash
 * tile so layouts stay aligned.
 */
export function BrandIcon({
  name,
  size = 16,
  className = "",
}: {
  name: string | null;
  size?: number;
  className?: string;
}) {
  const normalized = (name ?? "").toLowerCase();
  for (const rule of RULES) {
    if (rule.test(normalized)) {
      return (
        <span className={`inline-flex shrink-0 items-center ${className}`}>
          {rule.render(size)}
        </span>
      );
    }
  }
  const initial = name?.trim().charAt(0).toUpperCase() ?? "—";
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-[var(--border-default)] bg-[var(--background-subtle)] font-mono font-semibold text-[var(--text-muted)] ${className}`}
    >
      {initial}
    </span>
  );
}
