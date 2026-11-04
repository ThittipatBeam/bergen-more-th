import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import { MetricsSection } from "@/components/sections/MetricsSection";

export const metadata: Metadata = {
  title: "Metrics Explained • SIAM.AI Benchmark",
  description:
    "How each benchmark score is calculated: the Wikipedia-board metrics and overall-score weights, or the NitiBench+ Bar rubric and Citation F1, each with formulas and a worked example.",
};

export default function MetricsPage() {
  return (
    <main className="flex-1 w-full">
      <MetricsSection />
    </main>
  );
}
