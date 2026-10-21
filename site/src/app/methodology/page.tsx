import type { Metadata } from "next";
import { MethodologySection } from "@/components/sections/MethodologySection";

export const metadata: Metadata = {
  title: "Methodology • SIAM.AI Benchmark",
  description:
    "Learn about the standardized tri-component evaluation setup, Thai datasets, and KIMI-K3 automated scoring protocol.",
};

export default function MethodologyPage() {
  return (
    <main className="flex-1 w-full">
      <MethodologySection />
    </main>
  );
}
