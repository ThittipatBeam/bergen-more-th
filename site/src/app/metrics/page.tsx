import type { Metadata } from "next";
import { MetricsSection } from "@/components/sections/MetricsSection";

export const metadata: Metadata = {
  title: "Evaluation Metrics • SIAM.AI Benchmark",
  description:
    "Explore the formulas and criteria for Thai RAG evaluation, including LLM judge score, Thai lexical overlap (M_th), exact match, and recall.",
};

export default function MetricsPage() {
  return (
    <main className="flex-1 w-full">
      <MetricsSection />
    </main>
  );
}
