import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import { MetricsSection } from "@/components/sections/MetricsSection";

export const metadata: Metadata = {
  title: "Metrics Explained • SIAM.AI Benchmark",
  description:
    "How each Thai RAG benchmark score is calculated, including formulas, weighting for the overall score, and a guide to choosing metrics.",
};

export default function MetricsPage() {
  return (
    <main className="flex-1 w-full">
      <MetricsSection />
    </main>
  );
}
