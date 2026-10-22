import { PIPELINE_STAGES } from "@/lib/methodology-data";

interface PipelineFlowProps {
  accent: { fg: string; bg: string };
}

/** The path one leaderboard row takes, left to right. */
export function PipelineFlow({ accent }: PipelineFlowProps) {
  return (
    <ol
      aria-label="Stages of one pipeline run"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {PIPELINE_STAGES.map((stage, index) => (
        <li
          key={stage.label}
          className="relative flex flex-col gap-1 rounded-2xl border border-[var(--border-default)] bg-[var(--background-subtle)] p-4 sm:p-5"
        >
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-sans text-base font-semibold text-[var(--text-primary)]">
            {stage.label}
          </span>
          <span
            className="font-mono text-lg font-bold"
            style={{ color: accent.fg }}
          >
            {stage.value}
          </span>
          <span className="font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
            {stage.note}
          </span>
          {index < PIPELINE_STAGES.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-[var(--text-muted)] lg:block"
            >
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
