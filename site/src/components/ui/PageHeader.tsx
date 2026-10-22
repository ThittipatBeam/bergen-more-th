import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Small line above the title, e.g. "Metrics, explained". */
  kicker: string;
  title: string;
  /** One or two sentences, set at reading size. */
  lead: string;
  /** Mono summary line, e.g. "5,355 questions on file · 500 per run". */
  meta?: string;
  /** One link or action beside the meta line. */
  action?: ReactNode;
}

/** The shared masthead for every reading page: kicker, title, lead, meta row. */
export function PageHeader({
  kicker,
  title,
  lead,
  meta,
  action,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-[var(--border-default)] pb-8">
      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
        {kicker}
      </span>
      <h1 className="font-sans text-4xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-5xl">
        {title}
      </h1>
      <p className="max-w-[56ch] font-sans text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
        {lead}
      </p>
      {(meta || action) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1">
          {meta && (
            <p className="font-mono text-xs text-[var(--text-muted)]">{meta}</p>
          )}
          {action}
        </div>
      )}
    </header>
  );
}
