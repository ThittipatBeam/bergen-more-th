"use client";

import { getMethodologyChapters } from "@/lib/methodology-data";
import { MethodologyChapter } from "@/components/sections/MethodologyChapter";
import { PipelineFlow } from "@/components/sections/PipelineFlow";
import { DatasetStory } from "@/components/sections/DatasetStory";
import { PageHeader } from "@/components/ui/PageHeader";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { PAGE_SHELL } from "@/lib/design";

export function MethodologySection() {
  const { language } = useLanguage();
  const isTh = language === "TH";
  const chapters = getMethodologyChapters(language);
  const { systemDesign, questionBank } = chapters;

  return (
    <div className={PAGE_SHELL}>
      <PageHeader
        title={isTh ? "ที่มาของชุดข้อมูลและวิธีให้คะแนน" : "How the benchmark is built and scored"}
        action={
          <Link
            href="/metrics#worked-example"
            className="inline-flex min-h-[44px] items-center font-sans text-sm font-semibold text-[var(--brand-text)] transition-colors hover:text-[var(--brand-cta-hover)]"
          >
            {isTh
              ? "ดูตัวอย่างการคำนวณคะแนนทุก metric →"
              : "See one sample answer scored across all metrics →"}
          </Link>
        }
      />

      <MethodologyChapter
        chapter={systemDesign}
        kicker={systemDesign.number}
      >
        <PipelineFlow accent={systemDesign.accent} />
      </MethodologyChapter>

      <MethodologyChapter
        chapter={questionBank}
        kicker={questionBank.number}
      >
        <DatasetStory />
      </MethodologyChapter>

    </div>
  );
}
