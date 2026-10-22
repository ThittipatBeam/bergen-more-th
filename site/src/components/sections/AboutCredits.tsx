"use client";

import Image from "next/image";
import { Github, HuggingFace } from "@lobehub/icons";
import { AboutReveal } from "@/components/sections/AboutReveal";
import { getAboutCredits, getAboutPoweredBy } from "@/lib/about-data";
import type { AboutCredit } from "@/types/about";
import { useLanguage } from "@/hooks/use-language";

function BrandIcon({
  brand,
  size,
}: {
  brand: AboutCredit["brand"];
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

/** The projects this benchmark builds on, plus the cloud it runs on. */
export function AboutCredits() {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const credits = getAboutCredits(language);
  const poweredBy = getAboutPoweredBy(language);

  return (
    <AboutReveal>
      <div className="flex flex-col gap-4">
        <ul
          aria-label={isTh ? "กิตติกรรมประกาศ" : "Credits"}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {credits.map((credit) => (
            <li
              key={credit.name}
              data-reveal
              className="group flex flex-col gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 shadow-2xs transition-[translate,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-[var(--brand-sky-light)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl transition-[scale] duration-300 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  style={{
                    backgroundColor: "var(--surface-brand)",
                    color: "var(--brand-text)",
                  }}
                >
                  <BrandIcon brand={credit.brand} size={20} />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {credit.role}
                  </span>
                  <h3 className="font-sans text-base font-bold text-[var(--text-primary)]">
                    {credit.name}
                  </h3>
                </div>
              </div>

              <p className="font-sans text-base leading-7 text-[var(--text-secondary)]">
                {credit.description}
              </p>

              <a
                href={credit.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex min-h-[44px] w-fit items-center gap-1.5 font-sans text-sm font-semibold text-[var(--brand-text)] underline-offset-2 transition-colors hover:text-[var(--brand-cta-hover)] hover:underline"
              >
                {credit.brand === "github"
                  ? isTh
                    ? "ดูบน GitHub"
                    : "View on GitHub"
                  : isTh
                    ? "ดูบน Hugging Face"
                    : "Open on Hugging Face"}
                <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>

        <a
          href={poweredBy.href}
          target="_blank"
          rel="noopener noreferrer"
          data-reveal
          className="group flex min-h-[44px] flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-brand)] p-6 transition-colors hover:border-[var(--brand-sky-light)] sm:flex-row sm:items-center sm:gap-5"
        >
          <Image
            src="/brand-mark.png"
            alt=""
            aria-hidden="true"
            width={279}
            height={140}
            unoptimized
            className="h-6 w-auto shrink-0 self-start dark:hidden sm:self-center"
          />
          <Image
            src="/brand-mark-white.png"
            alt=""
            aria-hidden="true"
            width={279}
            height={140}
            unoptimized
            className="hidden h-6 w-auto shrink-0 self-start dark:block sm:self-center"
          />

          <div className="flex min-w-0 flex-col">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--brand-text)]">
              {poweredBy.label}
            </span>
            <p className="font-sans text-base leading-7 text-[var(--text-secondary)]">
              {poweredBy.description}
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 font-sans text-sm font-semibold text-[var(--brand-text)] underline-offset-2 group-hover:underline sm:ml-auto">
            siam.ai
            <span aria-hidden="true">↗</span>
          </span>
          <span className="sr-only">
            {poweredBy.name} (opens in a new tab)
          </span>
        </a>
      </div>
    </AboutReveal>
  );
}
