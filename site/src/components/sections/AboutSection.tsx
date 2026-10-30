"use client";

import Image from "next/image";
import { ABOUT_LINKS, getAboutChapters, getWhoWeAre } from "@/lib/about-data";
import { AboutLinks } from "@/components/sections/AboutLinks";
import { AboutWhy } from "@/components/sections/AboutWhy";
import { NumberedChapter } from "@/components/ui/NumberedChapter";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";
import { BODY, MEASURE_BODY, PAGE_SHELL } from "@/lib/design";

export function AboutSection() {
  const { language } = useLanguage();
  const t = I18N[language].about;
  const chapters = getAboutChapters(language);
  const { why, resources, who } = chapters;
  const whoWeAreText = getWhoWeAre(language);

  return (
    <div className={PAGE_SHELL}>
      <PageHeader title={t.title} />

      <NumberedChapter
        id={why.id}
        kicker={why.number}
        title={why.title}
        icon={why.icon}
        accent={why.accent}
      >
        <AboutWhy />
      </NumberedChapter>

      <NumberedChapter
        id={resources.id}
        kicker={resources.number}
        title={resources.title}
        icon={resources.icon}
        accent={resources.accent}
      >
        <AboutLinks />
      </NumberedChapter>

      <NumberedChapter
        id={who.id}
        kicker={who.number}
        title={who.title}
        icon={who.icon}
        accent={who.accent}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Image
              src="/brand-mark.png"
              alt=""
              aria-hidden="true"
              width={279}
              height={140}
              unoptimized
              className="h-8 w-auto shrink-0 dark:hidden"
            />
            <Image
              src="/brand-mark-white.png"
              alt=""
              aria-hidden="true"
              width={279}
              height={140}
              unoptimized
              className="hidden h-8 w-auto shrink-0 dark:block"
            />
            <span className="font-sans text-base font-bold text-[var(--text-primary)]">
              SIAM.AI Cloud
            </span>
            <a
              href={ABOUT_LINKS.cloud}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1 font-sans text-sm font-semibold text-[var(--brand-text)] underline-offset-2 transition-colors hover:text-[var(--brand-cta-hover)] hover:underline"
            >
              siam.ai
              <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>

          <p className={`${BODY} ${MEASURE_BODY} text-[var(--text-secondary)]`}>
            {whoWeAreText}
          </p>
        </div>
      </NumberedChapter>
    </div>
  );
}
