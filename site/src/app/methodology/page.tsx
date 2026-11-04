import type { Metadata } from "next";
import { MethodologySection } from "@/components/sections/MethodologySection";

export const metadata: Metadata = {
  title: "Methodology • SIAM.AI Benchmark",
  description:
    "How the benchmarks are built: the shared three-stage pipeline, how the 500 Thai Wikipedia questions and the 498 NitiBench+ legal cases were created, and how each answer gets scored.",
};

export default function MethodologyPage() {
  return (
    <main className="flex-1 w-full">
      <MethodologySection />
    </main>
  );
}
