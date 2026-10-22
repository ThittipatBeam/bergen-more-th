import type { Metadata } from "next";
import { MethodologySection } from "@/components/sections/MethodologySection";

export const metadata: Metadata = {
  title: "Methodology • SIAM.AI Benchmark",
  description:
    "How the benchmark is built: the three-part pipeline, how 5,355 Thai questions were generated from Thai Wikipedia and verified, why each run uses 500 of them, and how KIMI-K3 scores every answer.",
};

export default function MethodologyPage() {
  return (
    <main className="flex-1 w-full">
      <MethodologySection />
    </main>
  );
}
