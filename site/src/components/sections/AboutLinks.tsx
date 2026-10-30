"use client";

import Image from "next/image";
import { Fragment } from "react";
import { Cohere, Github, HuggingFace } from "@lobehub/icons";
import { AboutReveal } from "@/components/sections/AboutReveal";
import { getAboutLinks, getAboutSponsors } from "@/lib/about-data";
import type { AboutLink } from "@/types/about";
import { useLanguage } from "@/hooks/use-language";
import { KICKER, SMALL } from "@/lib/design";

function BrandIcon({
  brand,
  size,
}: {
  brand: AboutLink["brand"];
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

/** The repo, the dataset, and the upstream projects, plus the sponsors behind the runs. */
export function AboutLinks() {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const links = getAboutLinks(language);
  const sponsors = getAboutSponsors(language);

  return (
    <AboutReveal>
      <div className="flex flex-col gap-4">
        <ul
          aria-label={isTh ? "แหล่งข้อมูลและโครงการต้นทาง" : "Public resources and upstream projects"}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {links.map((link) => {
            const repoStyle = link.name.includes("/");
            return (
              <li
                key={link.name}
                data-reveal
                className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] p-5 shadow-2xs transition-[translate,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-[var(--brand-sky-light)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
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
                    <BrandIcon brand={link.brand} size={20} />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className={`${KICKER} text-[var(--text-muted)]`}>
                      {link.label}
                    </span>
                    <h3
                      className={`break-words font-semibold text-[var(--text-primary)] ${
                        repoStyle
                          ? "font-mono text-[13px] lg:text-sm"
                          : "font-sans text-base"
                      }`}
                    >
                      {repoStyle
                        ? link.name.split("/").map((part, index) => (
                            <Fragment key={part}>
                              {index > 0 && "/"}
                              {index > 0 && <wbr />}
                              {part}
                            </Fragment>
                          ))
                        : link.name}
                    </h3>
                  </div>
                </div>

                <p className={`${SMALL} text-[var(--text-secondary)]`}>
                  {link.description}
                </p>

                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex min-h-[44px] w-fit items-center gap-1.5 font-sans text-sm font-semibold text-[var(--brand-text)] underline-offset-2 transition-colors hover:text-[var(--brand-cta-hover)] hover:underline"
                >
                  {link.cta}
                  <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            );
          })}
        </ul>

        {sponsors.map((sponsor) => (
          <a
            key={sponsor.name}
            href={sponsor.href}
            target="_blank"
            rel="noopener noreferrer"
            data-reveal
            className={`group flex min-h-[44px] flex-col gap-3 rounded-2xl border border-[var(--border-default)] p-5 transition-colors sm:flex-row sm:items-center sm:gap-5 ${
              sponsor.tone === "positive"
                ? "bg-[var(--positive-bg)] hover:border-[var(--positive)]"
                : "bg-[var(--surface-brand)] hover:border-[var(--brand-sky-light)]"
            }`}
          >
            {sponsor.icon === "brandmark" ? (
              <>
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
              </>
            ) : (
              <span
                aria-hidden="true"
                className="inline-flex shrink-0 self-start text-[var(--positive)] sm:self-center"
              >
                <Cohere size={28} />
              </span>
            )}

            <div className="flex min-w-0 flex-col">
              <span
                className={`font-mono text-[11px] font-bold uppercase tracking-wider ${
                  sponsor.tone === "positive"
                    ? "text-[var(--positive)]"
                    : "text-[var(--brand-text)]"
                }`}
              >
                {sponsor.label}
              </span>
              <p className={`${SMALL} text-[var(--text-secondary)]`}>
                {sponsor.description}
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 font-sans text-sm font-semibold underline-offset-2 group-hover:underline sm:ml-auto ${
                sponsor.tone === "positive"
                  ? "text-[var(--positive)]"
                  : "text-[var(--brand-text)]"
              }`}
            >
              {sponsor.hrefLabel}
              <span aria-hidden="true">↗</span>
            </span>
            <span className="sr-only">{sponsor.name} (opens in a new tab)</span>
          </a>
        ))}
      </div>
    </AboutReveal>
  );
}
