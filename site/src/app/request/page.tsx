import type { Metadata } from "next";
import { RequestSection } from "@/components/sections/RequestSection";

export const metadata: Metadata = {
  title: "Request a Run • SIAM.AI Benchmark",
  description:
    "Request Generator, Embedding, and optional Reranker models to be evaluated on the Thai RAG benchmark. Give us the model names, optional links, and an email to reply to.",
};

export default function RequestPage() {
  return (
    <main className="flex-1 w-full">
      <RequestSection />
    </main>
  );
}
