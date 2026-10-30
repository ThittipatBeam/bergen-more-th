"use client";

import Link from "next/link";
import { MetricTable } from "./MetricTable";
import { MetricsWorkedExample } from "./MetricsWorkedExample";
import { MetricsOverallScore } from "./MetricsOverallScore";
import { MetricsWhichScore } from "./MetricsWhichScore";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/hooks/use-language";
import { PAGE_SHELL } from "@/lib/design";

export function MetricsSection() {
  const { language } = useLanguage();
  const isTh = language === "TH";

  return (
    <div className={PAGE_SHELL}>
      <PageHeader
        title={isTh ? "ตัวชี้วัด" : "Metric"}
        action={
          <Link
            href="#worked-example"
            className="inline-flex min-h-[44px] items-center font-sans text-sm font-semibold text-[var(--brand-text)] transition-colors hover:text-[var(--brand-cta-hover)]"
          >
            {isTh
              ? "ดูตัวอย่างการคำนวณคะแนนจริงทุก metric →"
              : "See how one answer scores across every metric →"}
          </Link>
        }
      />

      <MetricsWhichScore />

      <MetricTable />

      <MetricsWorkedExample />

      <MetricsOverallScore />
    </div>
  );
}
