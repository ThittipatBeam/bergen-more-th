import type { Metadata } from "next";
import { RequestSection } from "@/components/sections/RequestSection";

export const metadata: Metadata = {
  title: "Request Benchmark • SIAM.AI",
  description:
    "Request custom Generator, Embedding, and Reranker model combinations to be evaluated on the Thai RAG benchmark.",
};

export default function RequestPage() {
  return (
    <main className="flex-1 w-full">
      <RequestSection />
    </main>
  );
}
