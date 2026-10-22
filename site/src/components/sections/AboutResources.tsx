"use client";

import { Fragment } from "react";
import { Github, HuggingFace } from "@lobehub/icons";
import { AboutReveal } from "@/components/sections/AboutReveal";
import { getAboutResources } from "@/lib/about-data";
import type { AboutResource } from "@/types/about";
import { useLanguage } from "@/hooks/use-language";

function BrandIcon({
  brand,
  size,
}: {
  brand: AboutResource["brand"];
  size: number;
}) {
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center">
      {brand === "github" ? (
        <Github size={size} />
      ) : (
        <HuggingFace.Color size={size} />
      )}
    </span>
  );
}

/** The repo and the dataset: where every published number comes from. */
export function AboutResources() {
  const { language } = useLanguage();
  const resources = getAboutResources(language);

  return (
    <AboutReveal>
      <ul
        aria-label={language === "TH" ? "แหล่งข้อมูลและคลังโค้ดเปิด" : "Public resources"}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {resources.map((resource) => (
          <li
            key={resource.name}
            data-reveal
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-2xs transition-[translate,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-[var(--brand-sky-light)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <span
              aria-hidden="true"
              data-reveal-rule
              className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-[var(--brand-sky-blue)] to-transparent"
            />
            <div className="flex items-center gap-3">
              <span
                data-reveal-icon
                className="grid size-10 shrink-0 place-items-center rounded-xl transition-[scale] duration-300 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                style={{
                  backgroundColor: "var(--surface-brand)",
                  color: "var(--brand-text)",
                }}
              >
                <BrandIcon brand={resource.brand} size={20} />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {resource.kind === "code"
                    ? language === "TH"
                      ? "คลังโค้ด"
                      : "Code"
                    : language === "TH"
                      ? "ชุดข้อมูล"
                      : "Dataset"}
                </span>
                <h3 className="break-words font-mono text-[13px] font-semibold text-[var(--text-primary)] lg:text-sm">
                  {resource.name.split("/").map((part, index) => (
                    <Fragment key={part}>
                      {index > 0 && "/"}
                      {index > 0 && <wbr />}
                      {part}
                    </Fragment>
                  ))}
                </h3>
              </div>
            </div>

            <p className="font-sans text-base leading-7 text-[var(--text-secondary)]">
              {resource.description}
            </p>

            <a
              href={resource.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex min-h-[44px] w-fit items-center gap-1.5 font-sans text-sm font-semibold text-[var(--brand-text)] underline-offset-2 transition-colors hover:text-[var(--brand-cta-hover)] hover:underline"
            >
              {resource.cta}
              <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </AboutReveal>
  );
}
