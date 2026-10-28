import type { Metadata } from "next";
import { RequestSection } from "@/components/sections/RequestSection";

export const metadata: Metadata = {
  title: "Request a Run • SIAM.AI Benchmark",
  description:
    "Submit generator, embedding, and optional reranker models for evaluation on the Thai RAG benchmark.",
};

export default function RequestPage() {
  return (
    <main className="flex-1 w-full">
      <RequestSection />
    </main>
  );
}
