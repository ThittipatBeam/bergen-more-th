import type { Metadata } from "next";
import { AboutSection } from "@/components/sections/AboutSection";

export const metadata: Metadata = {
  title: "About • SIAM.AI Thai RAG Benchmark",
  description:
    "Why the Thai RAG benchmark exists, the code and dataset behind every published number, the projects it builds on, and the team that runs it.",
};

export default function AboutPage() {
  return (
    <main className="flex-1 w-full">
      <AboutSection />
    </main>
  );
}
