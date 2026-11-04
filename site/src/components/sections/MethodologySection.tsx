"use client";

import { getMethodologyChapters } from "@/lib/methodology-data";
import { getNitiChapters } from "@/lib/nitibench-methodology-data";
import { MethodologyChapter } from "@/components/sections/MethodologyChapter";
import { PipelineFlow } from "@/components/sections/PipelineFlow";
import { DatasetStory } from "@/components/sections/DatasetStory";
import { PageHeader } from "@/components/ui/PageHeader";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { useDataset } from "@/hooks/use-dataset";
import { PAGE_SHELL } from "@/lib/design";

export function MethodologySection() {
  const { language } = useLanguage();
  const { isNiti } = useDataset();
  const isTh = language === "TH";
  const chapters = isNiti
    ? getNitiChapters(language)
    : getMethodologyChapters(language);
  const { systemDesign, questionBank } = chapters;

  return (
    <div className={PAGE_SHELL}>
      <PageHeader
        title={
          isNiti
            ? isTh
              ? "ที่มาของชุดคดีกฎหมายและวิธีให้คะแนน"
              : "How the legal benchmark is built and scored"
            : isTh
              ? "ที่มาของชุดข้อมูลและวิธีให้คะแนน"
              : "How the benchmark is built and scored"
        }
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
