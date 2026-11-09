import { nitiPct } from "@/components/sections/NitiBenchCard";

/** Percentage metric with the same shared 0–100 track as the Wikipedia board. */
export function NitiBenchMetricCell({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="font-mono text-xs text-[var(--text-muted)]">—</span>;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <span className="font-mono text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-tight">
        {nitiPct(value)}
      </span>
      <div
        className="w-10 h-[3px] rounded-full bg-[var(--border-default)] mt-1 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            backgroundImage:
              "linear-gradient(90deg, var(--metric-bar-from), var(--metric-bar-to))",
          }}
        />
      </div>
    </div>
  );
}
