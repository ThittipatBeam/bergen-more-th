import { WHY_PANEL, WHY_PARAGRAPHS } from "@/lib/about-data";

/** The case for the benchmark, with what stays fixed and what changes. */
export function AboutWhy() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        {WHY_PARAGRAPHS.map((paragraph) => (
          <p
            key={paragraph.slice(0, 32)}
            className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-secondary)]"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <dl className="grid grid-cols-1 gap-6 border-t border-[var(--border-default)] pt-6 sm:grid-cols-2 sm:gap-10">
        {[WHY_PANEL.fixed, WHY_PANEL.varied].map((item) => (
          <div key={item.label} className="flex flex-col gap-1.5">
            <dt className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
              {item.label}
            </dt>
            <dd className="max-w-[46ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
