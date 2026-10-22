import type { ReactNode } from "react";
import { MetricIcon } from "@/components/ui/MetricIcon";
import type { MetricIconName } from "@/types/metrics";

interface NumberedChapterProps {
  id: string;
  /** Small line above the title, e.g. "Chapter 01" or just "01". */
  kicker: string;
  title: string;
  /** One sentence introducing the chapter. */
  intro: string;
  icon: MetricIconName;
  accent: { fg: string; bg: string };
  /** "relaxed" gives long reading pages a wider rhythm and larger type. */
  density?: "compact" | "relaxed";
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
  density = "compact",
  children,
}: NumberedChapterProps) {
  const relaxed = density === "relaxed";

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`flex scroll-mt-28 flex-col border-t border-[var(--border-default)] first-of-type:border-t-0 first-of-type:pt-0 ${
        relaxed ? "gap-6 pt-8 sm:gap-8 sm:pt-12" : "gap-4 pt-6"
      }`}
    >
      <header className={`flex items-start ${relaxed ? "gap-4" : "gap-3"}`}>
        <span
          aria-hidden="true"
          className={`grid shrink-0 place-items-center rounded-xl ${
            relaxed ? "size-12" : "size-10"
          }`}
          style={{ backgroundColor: accent.bg, color: accent.fg }}
        >
          <MetricIcon name={icon} className={relaxed ? "size-7" : "size-6"} />
        </span>
        <div className={`flex min-w-0 flex-col ${relaxed ? "gap-2" : "gap-1"}`}>
          <span
            className="font-mono text-xs font-bold uppercase tracking-wider"
            style={{ color: accent.fg }}
          >
            {kicker}
          </span>
          <h2
            id={`${id}-title`}
            className={`font-sans font-bold tracking-tight text-[var(--text-primary)] ${
              relaxed ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
            }`}
          >
            {title}
          </h2>
          <p
            className={`font-sans text-[var(--text-secondary)] ${
              relaxed
                ? "max-w-[58ch] text-base leading-7"
                : "max-w-2xl text-sm leading-relaxed"
            }`}
          >
            {intro}
          </p>
        </div>
      </header>

      {children}
    </section>
  );
}
