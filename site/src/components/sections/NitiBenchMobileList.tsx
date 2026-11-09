"use client";

import Link from "next/link";
import type { NitiBenchRow } from "@/types/benchmark";
import { NitiBenchCard } from "@/components/sections/NitiBenchCard";
import { useLanguage } from "@/hooks/use-language";

interface NitiBenchMobileListProps {
  rows: NitiBenchRow[];
  barMin: number;
  barMax: number;
}

export function NitiBenchMobileList({ rows, barMin, barMax }: NitiBenchMobileListProps) {
  const { language } = useLanguage();
  const isTh = language === "TH";

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <p className="text-xs leading-5 text-[var(--text-muted)]">
        {isTh
          ? "จัดอันดับตามคะแนน Bar และใช้ Citation F1 เมื่อคะแนนเท่ากัน เฉดสีเข้มขึ้นคือคะแนนสูงขึ้น เวลาสร้างครอบคลุมการเขียนคำตอบทั้ง 498 คดี"
          : "Ranked by Bar score, with Citation F1 breaking ties. A darker tint means a higher score. Generation time covers answer writing across all 498 cases."}
      </p>
      <ol className="divide-y divide-[var(--border-default)] overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--background-primary)] shadow-xs">
        {rows.map((row) => (
          <NitiBenchCard
            key={row.id}
            row={row}
            isTh={isTh}
            barMin={barMin}
            barMax={barMax}
          />
        ))}
      </ol>
      <Link
        href="/request"
        className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] px-4 font-mono text-xs font-semibold tracking-wide text-[var(--brand-text)] transition-colors hover:border-[var(--brand-sky-light)] hover:text-[var(--brand-cta-hover)]"
      >
        {isTh
          ? "ต้องการทดสอบโมเดลอื่น? ส่งคำขอทดสอบที่นี่ →"
          : "Missing a combination? Request a run →"}
      </Link>
    </div>
  );
}
