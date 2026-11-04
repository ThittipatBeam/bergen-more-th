import type { ChampionPick, NitiBenchRow } from "@/types/benchmark";
import type { Language } from "@/hooks/use-language";
import { formatClock } from "@/lib/benchmark-data";
import { NITI_ROWS } from "@/lib/nitibench-data";

const byBest = (
  rows: NitiBenchRow[],
  pick: (row: NitiBenchRow) => number
): NitiBenchRow | undefined =>
  [...rows].sort((a, b) => pick(b) - pick(a))[0];

/**
 * Hero deck for the NitiBench board: same three-category shape as the
 * Wikipedia champions, ranked on the metrics that board actually reports.
 * Categories — best Bar score (quality), best Citation F1 (match), fastest
 * generation (speed).
 */
export function getNitiChampionPicks(lang: Language = "EN"): ChampionPick[] {
  const rows = NITI_ROWS;
  const isTh = lang === "TH";
  const picks: ChampionPick[] = [];

  const barBest = byBest(rows, (row) => row.rubricBar);
  const citeBest = byBest(rows, (row) => row.citationF1);
  const speedBest = byBest(rows, (row) =>
    row.genSeconds === null ? Number.NEGATIVE_INFINITY : -row.genSeconds
  );

  const barLabel = isTh ? "Bar (0–10)" : "Bar (0–10)";
  const casesOf = (row: NitiBenchRow) =>
    row.nCases === null ? isTh ? "ทุกคดีในชุดทดสอบ" : "every case on the board" : isTh ? `${row.nCases} คดี` : `${row.nCases} cases`;

  if (barBest) {
    picks.push({
      id: "quality",
      tabLabel: isTh ? "ตัดสินดีสุดตามมาตรฐานสภาทนาย" : "Best Bar-standard score",
      categoryTitle: isTh ? "คะแนน rubric สูงสุด" : "Highest rubric score",
      badge: isTh ? "คะแนนสูงสุด" : "Top Score",
      storyTitle: isTh
        ? "คะแนน rubric สภาทนายสูงที่สุดบนบอร์ด"
        : "Highest Bar-standard rubric score on the board.",
      storyText: isTh
        ? `${barBest.generator} ได้ ${barBest.rubricBar.toFixed(2)}/10 จาก judge บน ${casesOf(barBest)}`
        : `${barBest.generator} scored ${barBest.rubricBar.toFixed(2)}/10 with the judge across ${casesOf(barBest)}.`,
      icon: "trophy",
      accent: "var(--brand-text)",
      primaryMetric: { label: barLabel, value: barBest.rubricBar.toFixed(2) },
      secondaryMetric: {
        label: "Citation F1",
        value: `${barBest.citationF1.toFixed(1)}%`,
      },
      row: barBest,
    });
  }

  if (citeBest) {
    picks.push({
      id: "match",
      tabLabel: isTh ? "อ้างถูกมาตรามากสุด" : "Cleanest citations",
      categoryTitle: isTh ? "อ้างถูกมาตราสูงสุด" : "Best citation match",
      badge: isTh ? "Citation ดีสุด" : "Top Citation",
      storyTitle: isTh
        ? "อ้างมาตราได้ตรงเฉลยมากที่สุด"
        : "Most citations land on the right statute version.",
      storyText: isTh
        ? `${citeBest.generator} ให้ Citation F1 ${citeBest.citationF1.toFixed(1)}% โดยคะแนน rubric อยู่ที่ ${citeBest.rubricBar.toFixed(2)}/10`
        : `${citeBest.generator} reached ${citeBest.citationF1.toFixed(1)}% Citation F1 while scoring ${citeBest.rubricBar.toFixed(2)}/10 on the rubric.`,
      icon: "target",
      accent: "var(--brand-text)",
      primaryMetric: {
        label: "Citation F1",
        value: `${citeBest.citationF1.toFixed(1)}%`,
      },
      secondaryMetric: { label: barLabel, value: citeBest.rubricBar.toFixed(2) },
      row: citeBest,
    });
  }

  if (speedBest && speedBest.genSeconds !== null) {
    picks.push({
      id: "speed",
      tabLabel: isTh ? "เขียนคำตอบเร็วสุด" : "Fastest generation",
      categoryTitle: isTh ? "เขียนคำตอบเร็วที่สุด" : "Fastest generation",
      badge: isTh ? "เร็วสุด" : "Top Speed",
      storyTitle: isTh
        ? "เขียนคำตอบครบชุดได้เร็วที่สุดบนบอร์ด"
        : "Fastest full writing pass on the board.",
      storyText: isTh
        ? `${speedBest.generator} เขียนคำตอบครบใน ${formatClock(speedBest.genSeconds)} โดยได้ rubric ${speedBest.rubricBar.toFixed(2)}/10`
        : `${speedBest.generator} wrote every answer in ${formatClock(speedBest.genSeconds)}, scoring ${speedBest.rubricBar.toFixed(2)}/10 on the rubric.`,
      icon: "bolt",
      accent: "var(--perf-text)",
      primaryMetric: {
        label: isTh ? "เวลาสร้าง" : "Gen time",
        value: formatClock(speedBest.genSeconds),
      },
      secondaryMetric: {
        label: barLabel,
        value: speedBest.rubricBar.toFixed(2),
      },
      row: speedBest,
    });
  }

  return picks;
}
