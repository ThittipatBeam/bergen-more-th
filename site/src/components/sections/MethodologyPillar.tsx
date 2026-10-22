import type { MethodologyBlock } from "@/types/methodology";

interface MethodologyPillarProps {
  block: MethodologyBlock;
  accent: { fg: string; bg: string };
}

/** A pillar block kept word-for-word from the approved methodology copy. */
export function MethodologyPillar({ block, accent }: MethodologyPillarProps) {
  return (
    <article className="flex flex-col gap-5 rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-2xs transition-colors sm:p-8">
      <div className="flex flex-col gap-2.5">
        <span
          className="w-fit rounded-full px-2.5 py-1 font-sans text-xs font-semibold"
          style={{ backgroundColor: accent.bg, color: accent.fg }}
        >
          {block.badge}
        </span>
        <h3 className="font-sans text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
          {block.title}
        </h3>
      </div>

      <p className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
        {block.description}
      </p>

      <ul className="grid gap-x-8 gap-y-3 border-t border-[var(--border-default)] pt-5 sm:grid-cols-3">
        {block.details.map((detail) => (
          <li
            key={detail}
            className="flex items-start gap-2.5 font-sans text-base leading-relaxed text-[var(--text-secondary)]"
          >
            <span
              aria-hidden="true"
              className="mt-2.5 size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: accent.fg }}
            />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
