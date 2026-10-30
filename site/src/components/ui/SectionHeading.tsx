import { H2, KICKER, LEAD, MEASURE_LEAD } from "@/lib/design";

interface SectionHeadingProps {
  /** id for the h2, when the section uses aria-labelledby. */
  id?: string;
  /** Small line above the title, e.g. "Reference". */
  kicker?: string;
  title: string;
  /** Optional lead sentence under the title. */
  intro?: string;
  className?: string;
}

/** The section header used inside cards. Same kicker/title/intro rhythm on every page. */
export function SectionHeading({
  id,
  kicker,
  title,
  intro,
  className = "",
}: SectionHeadingProps) {
  return (
    <header className={`flex flex-col gap-2 ${className}`}>
      {kicker && (
        <span className={`${KICKER} text-[var(--brand-text)]`}>{kicker}</span>
      )}
      <h2 id={id} className={`${H2} text-[var(--text-primary)]`}>
        {title}
      </h2>
      {intro && (
        <p className={`${LEAD} ${MEASURE_LEAD} text-[var(--text-secondary)]`}>
          {intro}
        </p>
      )}
    </header>
  );
}
