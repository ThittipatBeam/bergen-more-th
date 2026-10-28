import type { Metadata } from "next";
import { MethodologySection } from "@/components/sections/MethodologySection";

export const metadata: Metadata = {
  title: "Methodology • SIAM.AI Benchmark",
  description:
    "How the benchmark is built: the three-stage pipeline, how 5,355 Thai questions were created from Thai Wikipedia, why runs use 500 questions, and how KIMI-K3 scores answers.",
};

export default function MethodologyPage() {
  return (
    <main className="flex-1 w-full">
      <MethodologySection />
    </main>
  );
}
