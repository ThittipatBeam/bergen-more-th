import { HuggingFace } from "@lobehub/icons";
import {
  DATASET_RESULT,
  DATASET_SIZE,
  DATASET_STEPS,
  SAMPLE_REASONS,
} from "@/lib/methodology-data";

const format = (value: number) => value.toLocaleString("en-US");

/** How the question bank is built, step by step, then why a run uses 500 of it. */
export function DatasetStory() {
  const usedShare = (DATASET_SIZE.perRun / DATASET_SIZE.bank) * 100;
  const lastStep = DATASET_STEPS.length - 1;

  return (
    <div className="flex flex-col gap-10">
      <ol aria-label="How the question bank is built" className="flex flex-col">
        {DATASET_STEPS.map((step, index) => (
          <li
            key={step.title}
            className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-4 pb-12 last:pb-0 sm:gap-6"
          >
            {index < lastStep && (
              <span
                aria-hidden="true"
                className="absolute top-10 bottom-0 left-[1.125rem] w-px -translate-x-1/2 bg-[var(--border-default)] sm:top-12 sm:left-[1.375rem]"
              />
            )}
            <span className="relative z-10 grid size-9 place-items-center rounded-full bg-[var(--surface-brand)] font-mono text-sm font-bold text-[var(--brand-text)] sm:size-11">
              {index + 1}
            </span>

            <div className="flex min-w-0 flex-col gap-2.5">
              <h3 className="font-sans text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl">
                {step.title}
              </h3>
              <p className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
                {step.body}
              </p>

              {step.source && (
                <a
                  href={step.source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] w-fit items-center gap-2 font-sans text-sm font-semibold text-[var(--brand-text)] underline-offset-2 transition-colors hover:text-[var(--brand-cta-hover)] hover:underline"
                >
                  <span aria-hidden="true" className="inline-flex shrink-0 items-center">
                    <HuggingFace.Color size={16} />
                  </span>
                  {step.source.label}
                  <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}

              <span className="font-mono text-xs leading-relaxed text-[var(--text-muted)]">
                {step.meta}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <p className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">
          The result.{" "}
        </span>
        {DATASET_RESULT}
      </p>

      <section
        aria-labelledby="bank-and-run-title"
        className="flex flex-col gap-8 rounded-3xl border border-[var(--border-default)] bg-[var(--surface-brand)] p-6 sm:p-8"
      >
        <header className="flex flex-col gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
            The bank and the run
          </span>
          <h3
            id="bank-and-run-title"
            className="font-sans text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          >
            {format(DATASET_SIZE.bank)} questions on file,{" "}
            {format(DATASET_SIZE.perRun)} per run
          </h3>
          <p className="max-w-[58ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
            Running every pipeline over all {format(DATASET_SIZE.bank)} questions
            would take hours and cost real money. So a leaderboard run uses a
            fixed sample of {format(DATASET_SIZE.perRun)} instead.
          </p>
        </header>

        <dl className="grid grid-cols-3 gap-4 border-t border-[var(--border-default)] pt-6 sm:gap-8">
          <div className="flex flex-col gap-1">
            <dt className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              On file
            </dt>
            <dd className="font-mono text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              {format(DATASET_SIZE.bank)}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Per run
            </dt>
            <dd className="font-mono text-2xl font-bold text-[var(--brand-text)] sm:text-3xl">
              {format(DATASET_SIZE.perRun)}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Share used
            </dt>
            <dd className="font-mono text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              {usedShare.toFixed(1)}%
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2">
          <div
            role="img"
            aria-label={`Each run uses ${format(
              DATASET_SIZE.perRun
            )} of ${format(DATASET_SIZE.bank)} questions, about ${usedShare.toFixed(
              1
            )} percent`}
            className="h-3 w-full overflow-hidden rounded-full bg-[var(--background-primary)]"
          >
            <div
              className="h-full rounded-full bg-[var(--brand-text)]"
              style={{ width: `${usedShare}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-xs text-[var(--text-muted)]">
            <span>{format(DATASET_SIZE.perRun)} used</span>
            <span>{format(DATASET_SIZE.bank)} on file</span>
          </div>
        </div>

        <ul className="grid gap-6 border-t border-[var(--border-default)] pt-6 sm:grid-cols-3 sm:gap-8">
          {SAMPLE_REASONS.map((reason) => (
            <li key={reason.title} className="flex flex-col gap-1.5">
              <p className="font-sans text-base font-semibold leading-snug text-[var(--text-primary)]">
                {reason.title}
              </p>
              <p className="font-sans text-base leading-relaxed text-[var(--text-secondary)]">
                {reason.body}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
