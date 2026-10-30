"use client";

import { getWhyPanel, getWhyParagraphs } from "@/lib/about-data";
import { useLanguage } from "@/hooks/use-language";
import { BODY, MEASURE_BODY } from "@/lib/design";

/** The case for the benchmark, with what stays fixed and what changes. */
export function AboutWhy() {
  const { language } = useLanguage();
  const paragraphs = getWhyParagraphs(language);
  const panel = getWhyPanel(language);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 32)}
            className={`${BODY} ${MEASURE_BODY} text-[var(--text-secondary)]`}
          >
            {paragraph}
          </p>
        ))}
      </div>

      <dl className="grid grid-cols-1 gap-6 border-t border-[var(--border-default)] pt-6 sm:grid-cols-2 sm:gap-10">
        {[panel.fixed, panel.varied].map((item) => (
          <div key={item.label} className="flex flex-col gap-1.5">
            <dt className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--brand-text)]">
              {item.label}
            </dt>
            <dd className={`${BODY} ${MEASURE_BODY} text-[var(--text-secondary)]`}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
