import type { ReactNode } from "react";

interface RequestModelRowProps {
  step: string;
  title: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

/** One pipeline component: its number, name, and the name/link inputs. */
export function RequestModelRow({
  step,
  title,
  required = false,
  hint,
  children,
}: RequestModelRowProps) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-4">
      <legend className="flex w-full flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-bold text-[var(--brand-text)]">
          {step}
        </span>
        <span className="font-sans text-base font-bold text-[var(--text-primary)]">
          {title}
        </span>
        {required ? (
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--negative)]">
            Required
          </span>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
            Optional
          </span>
        )}
      </legend>

      {hint && (
        <p className="max-w-[58ch] font-sans text-sm leading-relaxed text-[var(--text-muted)]">
          {hint}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
