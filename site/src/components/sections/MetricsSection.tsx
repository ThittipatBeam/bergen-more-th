import Link from "next/link";
import {
  BENCHMARK_ROWS,
  formatClock,
  JUDGE_NAME,
  JUDGE_N,
} from "@/lib/benchmark-data";
import { METRIC_CHAPTERS } from "@/lib/metrics-data";
import type { MetricChapter, MetricId } from "@/types/metrics";
import { MetricsChapter as ChapterBlock } from "./MetricsChapter";
import { MetricsOverallScore } from "./MetricsOverallScore";
import { MetricsWhichScore } from "./MetricsWhichScore";
import { PageHeader } from "@/components/ui/PageHeader";

const rangeOf = (values: number[]) =>
  values.length ? { min: Math.min(...values), max: Math.max(...values) } : null;

/** Live sentences for the two chapters whose meaning changes with the board. */
function buildInsights() {
  const precision = rangeOf(BENCHMARK_ROWS.map((row) => row.precisionTh));
  const recall = rangeOf(BENCHMARK_ROWS.map((row) => row.recallTh));
  const generation = rangeOf(
    BENCHMARK_ROWS.map((row) => row.genSeconds).filter(
      (seconds): seconds is number => seconds !== null
    )
  );

  const insights: Partial<Record<MetricChapter["id"], string>> = {};

  if (precision && recall) {
    insights["word-overlap"] =
      `recall sits at ${recall.min.toFixed(0)}–${recall.max.toFixed(0)}%, ` +
      `while precision sits at ${precision.min.toFixed(0)}–${precision.max.toFixed(0)}%. ` +
      "Models find the right words, then keep writing.";
  }

  // The speed chapter needs no insight box: its single card already carries the
  // board's range as its example line.
  const examples: Partial<Record<MetricId, string>> = generation
    ? {
        generation: `Today's board spans ${formatClock(
          generation.min
        )}–${formatClock(generation.max)} for all ${JUDGE_N} answers.`,
      }
    : {};

  return { insights, examples };
}

export function MetricsSection() {
  const { insights, examples } = buildInsights();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 pt-28 pb-20 sm:gap-16 sm:px-8 md:px-12">
      <PageHeader
        kicker="Metrics, explained"
        title="One question, seven scores"
        lead="We ask one Thai question, then grade the same answer three ways: is it right, how close are the words, how fast."
        meta={`${JUDGE_N} questions · ThaiWikiV4 · judge ${JUDGE_NAME}`}
        action={
          <Link
            href="/methodology#worked-example"
            className="inline-flex min-h-[44px] items-center font-sans text-sm font-semibold text-[var(--brand-text)] transition-colors hover:text-[var(--brand-cta-hover)]"
          >
            See how one answer scores on every metric &rarr;
          </Link>
        }
      />

      {METRIC_CHAPTERS.map((chapter) => (
        <ChapterBlock
          key={chapter.id}
          chapter={chapter}
          insight={insights[chapter.id]}
          examples={examples}
        />
      ))}

      <MetricsOverallScore />

      <MetricsWhichScore />
    </div>
  );
}
