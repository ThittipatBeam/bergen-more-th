import type { Metadata } from "next";
import { RequestSection } from "@/components/sections/RequestSection";

export const metadata: Metadata = {
  title: "Request a Run • SIAM.AI Benchmark",
  description:
    "Submit generator, embedding, and optional reranker models for evaluation on the Wikipedia V4 or NitiBench+ board.",
};

export default function RequestPage() {
  return (
    <main className="flex-1 w-full">
      <RequestSection />
    </main>
  );
}
