import Link from "next/link";
import { InteractiveTitle } from "@/components/ui/InteractiveTitle";
import { SmoothScrollLink } from "@/components/ui/SmoothScrollLink";
import { HeroBackdrop } from "@/components/sections/HeroBackdrop";
import { TopModelsSwitcher } from "@/components/sections/TopModelsSwitcher";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[85vh] flex flex-col justify-center overflow-hidden pt-32 sm:pt-36 md:pt-40 pb-16 px-6 sm:px-8">
      <HeroBackdrop />

      {/* Content: text left / switcher right on desktop, stacked on mobile */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] items-center gap-12 lg:gap-10 text-center lg:text-left">
        <div className="flex flex-col items-center lg:items-start">
          <InteractiveTitle
            text="Thai RAG Benchmark"
            className="text-3xl sm:text-5xl lg:text-6xl max-w-xl"
          />

          <p className="mt-5 sm:mt-6 max-w-xl text-sm sm:text-base md:text-lg text-[var(--text-secondary)] font-sans font-normal leading-relaxed transition-colors">
            Open benchmark for Thai retrieval-augmented generation — embedding,
            reranking, and generation pipelines scored by an LLM judge on Thai
            Wikipedia QA.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center lg:justify-start">
            <SmoothScrollLink
              href="#leaderboard"
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[var(--brand-cta)] hover:bg-[var(--brand-cta-hover)] text-white text-sm font-medium transition-all shadow-xs"
            >
              Explore Leaderboard
            </SmoothScrollLink>
            <Link
              href="/request"
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--background-primary)]/80 hover:bg-[var(--background-subtle)] text-[var(--text-primary)] text-sm font-medium transition-all shadow-xs"
            >
              Request a Benchmark
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <TopModelsSwitcher />
        </div>
      </div>

      {/* Scroll cue */}
      <div className="relative z-10 mt-14 sm:mt-16 flex flex-col items-center gap-1.5 text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">
        <span>Scroll to explore models</span>
        <span className="animate-bounce motion-reduce:animate-none text-sm text-[var(--brand-text)]">&darr;</span>
      </div>
    </section>
  );
}
