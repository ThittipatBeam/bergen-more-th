"use client";

import Image from "next/image";
import Link from "next/link";
import { ABOUT_LINKS, getAboutChapters, getWhoWeAre } from "@/lib/about-data";
import { AboutCredits } from "@/components/sections/AboutCredits";
import { AboutResources } from "@/components/sections/AboutResources";
import { AboutWhy } from "@/components/sections/AboutWhy";
import { NumberedChapter } from "@/components/ui/NumberedChapter";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/hooks/use-language";
import { I18N } from "@/lib/i18n/translations";

export function AboutSection() {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const t = I18N[language].about;
  const chapters = getAboutChapters(language);
  const { why, resources, acknowledgements, who } = chapters;
  const whoWeAreText = getWhoWeAre(language);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 pt-28 pb-20 sm:gap-16 sm:px-8 md:px-12">
      <PageHeader
        kicker={t.kicker}
        title={t.title}
        lead={t.lead}
      />

      <NumberedChapter
        id={why.id}
        kicker={isTh ? `บทที่ ${why.number}` : why.number}
        title={why.title}
        intro={why.intro}
        icon={why.icon}
        accent={why.accent}
        density="relaxed"
      >
        <AboutWhy />
      </NumberedChapter>

      <NumberedChapter
        id={resources.id}
        kicker={isTh ? `บทที่ ${resources.number}` : resources.number}
        title={resources.title}
        intro={resources.intro}
        icon={resources.icon}
        accent={resources.accent}
        density="relaxed"
      >
        <AboutResources />
      </NumberedChapter>

      <NumberedChapter
        id={acknowledgements.id}
        kicker={isTh ? `บทที่ ${acknowledgements.number}` : acknowledgements.number}
        title={acknowledgements.title}
        intro={acknowledgements.intro}
        icon={acknowledgements.icon}
        accent={acknowledgements.accent}
        density="relaxed"
      >
        <AboutCredits />
      </NumberedChapter>

      <NumberedChapter
        id={who.id}
        kicker={isTh ? `บทที่ ${who.number}` : who.number}
        title={who.title}
        intro={who.intro}
        icon={who.icon}
        accent={who.accent}
        density="relaxed"
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

          <p className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
            {whoWeAreText}
          </p>
        </div>
      </NumberedChapter>

      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-subtle)] p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="min-w-0">
          <h2 className="font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
            {isTh ? "ไม่พบไปป์ไลน์ที่คุณต้องการ?" : "Missing a combination?"}
          </h2>
          <p className="mt-2 max-w-[44ch] font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
            {isTh
              ? "ส่งรายละเอียดโมเดลและไปป์ไลน์ที่คุณต้องการทดสอบ แล้วทีมงานจะจัดคิวรันในรอบถัดไป"
              : "Request a pipeline and we will queue it for the next evaluation batch."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Link
            href="/methodology"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] px-5 font-sans text-sm font-semibold text-[var(--text-primary)] shadow-2xs transition-colors hover:text-[var(--brand-text)]"
          >
            {isTh ? "อ่านระเบียบวิธีวิจัย" : "Read the methodology"}
          </Link>
          <Link
            href="/request"
            className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-xl bg-[var(--brand-cta)] px-5 font-sans text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[var(--brand-cta-hover)]"
          >
            {isTh ? "ส่งคำขอทดสอบ →" : "Request a run →"}
          </Link>
        </div>
      </div>
    </div>
  );
}
