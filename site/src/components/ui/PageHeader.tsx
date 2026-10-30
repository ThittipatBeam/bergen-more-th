import type { ReactNode } from "react";
import { H1, KICKER, LEAD, MEASURE_LEAD, META } from "@/lib/design";

interface PageHeaderProps {
  /** Small line above the title. Omit for the bare document style. */
  kicker?: string;
  title: string;
  /** One or two sentences under the title. */
  lead?: string;
  /** Mono summary line, e.g. "5,355 questions on file · 500 per run". */
  meta?: string;
  /** One link or action beside the meta line. */
  action?: ReactNode;
}

/** The page masthead. Renders only the pieces you pass. */
export function PageHeader({
  kicker,
  title,
  lead,
  meta,
  action,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-[var(--border-default)] pb-8">
      {kicker && (
        <span className={`${KICKER} text-[var(--brand-text)]`}>{kicker}</span>
      )}
      <h1 className={`${H1} text-[var(--text-primary)]`}>{title}</h1>
      {lead && (
        <p className={`${LEAD} ${MEASURE_LEAD} text-[var(--text-secondary)]`}>
          {lead}
        </p>
      )}
      {(meta || action) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1">
          {meta && (
            <p className={`${META} text-[var(--text-muted)]`}>{meta}</p>
          )}
          {action}
        </div>
      )}
    </header>
  );
}
