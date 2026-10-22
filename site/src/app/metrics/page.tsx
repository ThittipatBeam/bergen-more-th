import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import { MetricsSection } from "@/components/sections/MetricsSection";

export const metadata: Metadata = {
  title: "Metrics Explained • SIAM.AI Benchmark",
  description:
    "What every Thai RAG benchmark score means — three plain-language sections, the exact formula behind each card, how the scores combine into the overall score that ranks the leaderboard, and a guide to which metric to use.",
};

export default function MetricsPage() {
  return (
    <main className="flex-1 w-full">
      <MetricsSection />
    </main>
  );
}
