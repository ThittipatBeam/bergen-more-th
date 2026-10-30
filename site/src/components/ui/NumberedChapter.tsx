import type { ReactNode } from "react";
import { MetricIcon } from "@/components/ui/MetricIcon";
import { H2, KICKER, LEAD, MEASURE_LEAD } from "@/lib/design";
import type { MetricIconName } from "@/types/metrics";

interface NumberedChapterProps {
  id: string;
  /** Small line above the title, e.g. "Chapter 01" or just "01". */
  kicker: string;
  title: string;
  /** One sentence introducing the chapter. Omit when the content speaks for itself. */
  intro?: string;
  icon: MetricIconName;
  accent: { fg: string; bg: string };
  children: ReactNode;
}

/** A numbered chapter: icon tile, kicker, title, one-sentence intro, content. */
export function NumberedChapter({
  id,
  kicker,
  title,
  intro,
  icon,
  accent,
  children,
}: NumberedChapterProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-28 flex-col gap-6 border-t border-[var(--border-default)] pt-8 first-of-type:border-t-0 first-of-type:pt-0 sm:gap-8 sm:pt-12"
    >
      <header className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: accent.bg, color: accent.fg }}
        >
          <MetricIcon name={icon} className="size-7" />
        </span>
        <div className="flex min-w-0 flex-col gap-2">
          <span
            className={`${KICKER}`}
            style={{ color: accent.fg }}
          >
            {kicker}
          </span>
          <h2
            id={`${id}-title`}
            className={`${H2} text-[var(--text-primary)]`}
          >
            {title}
          </h2>
          {intro && (
            <p className={`${LEAD} ${MEASURE_LEAD} text-[var(--text-secondary)]`}>
              {intro}
            </p>
          )}
        </div>
      </header>

      {children}
    </section>
  );
}
