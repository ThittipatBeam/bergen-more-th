import type { ReactNode } from "react";
import {
  BAAI,
  Claude,
  Cohere,
  DeepSeek,
  Google,
  Kimi,
  Meta,
  Mistral,
  OpenAI,
  Qwen,
} from "@lobehub/icons";

/** Model-name matchers -> brand icon (first match wins). */
const RULES: ReadonlyArray<{
  test: (normalized: string) => boolean;
  render: (size: number) => ReactNode;
}> = [
  { test: (n) => n.includes("deepseek"), render: (s) => <DeepSeek.Color size={s} /> },
  { test: (n) => n.includes("qwen"), render: (s) => <Qwen.Color size={s} /> },
  {
    // Cohere's models are named by family rather than vendor: command-a/r for
    // generation, embed-v*/embed-multilingual for retrieval, rerank-* for
    // reranking. "bge-reranker" must not match, hence the leading hyphen.
    test: (n) =>
      n.includes("cohere") ||
      n.includes("command-a") ||
      n.includes("command-r") ||
      /(^|\/)embed-(v|multilingual)/.test(n) ||
      /(^|\/)rerank-/.test(n),
    render: (s) => <Cohere.Color size={s} />,
  },
  {
    test: (n) => n.includes("kimi") || n.includes("moonshot"),
    render: (s) => (
      <span className="inline-flex items-center text-[var(--brand-text)]">
        <Kimi size={s} />
      </span>
    ),
  },
  { test: (n) => n.includes("bge") || n.includes("baai"), render: (s) => <BAAI size={s} /> },
  { test: (n) => n.includes("gpt") || n.includes("openai"), render: (s) => <OpenAI size={s} /> },
  { test: (n) => n.includes("claude") || n.includes("anthropic"), render: (s) => <Claude.Color size={s} /> },
  { test: (n) => n.includes("mistral"), render: (s) => <Mistral.Color size={s} /> },
  { test: (n) => n.includes("llama") || n.includes("meta"), render: (s) => <Meta.Color size={s} /> },
  { test: (n) => n.includes("gemini") || n.includes("google"), render: (s) => <Google.Color size={s} /> },
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
        <span
          aria-hidden="true"
          className={`inline-flex shrink-0 items-center ${className}`}
        >
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
