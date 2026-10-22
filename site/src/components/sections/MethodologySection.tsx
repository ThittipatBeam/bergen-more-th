import type { ReactNode } from "react";
import Link from "next/link";
import { JUDGE_NAME } from "@/lib/benchmark-data";
import {
  DATASET_SIZE,
  METHODOLOGY_CHAPTERS,
  SCORING_PROTOCOL,
  SYSTEM_DESIGN,
} from "@/lib/methodology-data";
import { MetricsWorkedExample } from "@/components/sections/MetricsWorkedExample";
import { MethodologyChapter } from "@/components/sections/MethodologyChapter";
import { MethodologyPillar } from "@/components/sections/MethodologyPillar";
import { PipelineFlow } from "@/components/sections/PipelineFlow";
import { DatasetStory } from "@/components/sections/DatasetStory";
import { ScoringChips } from "@/components/sections/ScoringChips";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmoothScrollLink } from "@/components/ui/SmoothScrollLink";

const { systemDesign, questionBank, scoring } = METHODOLOGY_CHAPTERS;

function Payoff({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[62ch] font-sans text-base leading-7 text-[var(--text-secondary)]">
      {children}
    </p>
  );
}

export function MethodologySection() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 pt-28 pb-20 sm:gap-16 sm:px-8 md:px-12">
      <PageHeader
        kicker="Methodology, told simply"
        title="How the board gets its numbers"
        lead="A pipeline answers a question. A judge decides if the answer is right. Here is how each part is made, in three short chapters."
        meta={`${DATASET_SIZE.bank.toLocaleString("en-US")} questions on file · ${
          DATASET_SIZE.perRun
        } per run · judge ${JUDGE_NAME}`}
        action={
          <SmoothScrollLink
            href="#worked-example"
            className="inline-flex min-h-[44px] items-center font-sans text-sm font-semibold text-[var(--brand-text)] transition-colors hover:text-[var(--brand-cta-hover)]"
          >
            See one answer score on every metric &rarr;
          </SmoothScrollLink>
        }
      />

      <MethodologyChapter chapter={systemDesign}>
        <MethodologyPillar
          block={SYSTEM_DESIGN}
          accent={systemDesign.accent}
        />
        <PipelineFlow accent={systemDesign.accent} />
        <Payoff>
          <span className="font-semibold text-[var(--text-primary)]">
            The point.{" "}
          </span>
          Only the models change; the three-part path stays the same, so any two
          rows can be compared.
        </Payoff>
      </MethodologyChapter>

      <MethodologyChapter chapter={questionBank}>
        <DatasetStory />
      </MethodologyChapter>

      <MethodologyChapter chapter={scoring}>
        <MethodologyPillar
          block={SCORING_PROTOCOL}
          accent={scoring.accent}
        />
        <ScoringChips />
        <Payoff>
          <span className="font-semibold text-[var(--text-primary)]">
            The point.{" "}
          </span>
          Correctness is 45% of Overall, and the judge is how we measure it.{" "}
          <Link
            href="/metrics#overall-score"
            className="font-semibold text-[var(--brand-text)] underline-offset-2 transition-colors hover:text-[var(--brand-cta-hover)] hover:underline"
          >
            See how the rest is built
          </Link>
          .
        </Payoff>
      </MethodologyChapter>

      {/* One answer, every score: the worked example closes the story. */}
      <MetricsWorkedExample />

      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-subtle)] p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
            Everything runs from the repo
          </h2>
          <p className="mt-2 max-w-[58ch] font-sans text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            The dataset scripts live in{" "}
            <code className="font-mono text-[0.95em] text-[var(--text-primary)]">
              th_data_gen/
            </code>{" "}
            — generate,
            verify, spot-check, build. Every evaluation run keeps its config and
            raw outputs, so anyone can re-run it.
          </p>
        </div>

        <Link
          href="/request"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-[var(--brand-cta)] px-6 font-sans text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[var(--brand-cta-hover)]"
        >
          Request a custom run &rarr;
        </Link>
      </div>
    </div>
  );
}
