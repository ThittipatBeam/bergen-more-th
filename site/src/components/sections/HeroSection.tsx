import { InteractiveTitle } from "@/components/ui/InteractiveTitle";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-32 sm:pt-36 md:pt-40 pb-16 px-6 sm:px-8">
      {/* 1. Cloudy Sky Gradient & Soft Grid Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[var(--background-canvas)] via-[var(--background-subtle)] to-[var(--surface-brand)] transition-colors duration-300"
      >
        <div
          className="absolute inset-0 opacity-40 dark:opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(7, 149, 207, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(7, 149, 207, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Soft radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background-canvas)_85%)] transition-colors duration-300" />
      </div>

      {/* 2. Delicate Architectural Sky Rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.06] dark:opacity-[0.08] overflow-hidden"
      >
        <div className="relative w-[900px] h-[900px]">
          <div className="absolute inset-10 border border-[#0795CF] rotate-1 rounded-3xl" />
          <div className="absolute inset-24 border border-[#01A9B1] -rotate-2 rounded-3xl" />
          <div className="absolute inset-36 border border-[#00A0BE] rotate-3 rounded-3xl" />
          <div className="absolute inset-48 border border-[#73B7DC] -rotate-1 rounded-3xl" />
        </div>
      </div>

      {/* 3. Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Headline */}
        <InteractiveTitle
          text="Thai RAG & Embedding Leaderboard"
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl"
        />

        {/* Subtitle */}
        <p className="mt-5 sm:mt-6 max-w-xl text-center text-sm sm:text-base md:text-lg text-[var(--text-secondary)] font-sans font-normal leading-relaxed transition-colors">
          Standardized open evaluation benchmark measuring Thai retrieval-augmented generation,
          dense vector models, and hybrid search performance.
        </p>

        {/* Quick Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <a
            href="#leaderboard"
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#0795CF] hover:bg-[#006B91] text-white text-sm font-medium transition-all shadow-xs"
          >
            Explore Leaderboard
          </a>
          <a
            href="https://siam.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--background-primary)]/80 hover:bg-[var(--background-subtle)] text-[var(--text-primary)] text-sm font-medium transition-all shadow-xs"
          >
            SIAM.AI Cloud
          </a>
        </div>

        {/* Subtle scroll cue indicator */}
        <div className="mt-12 sm:mt-14 flex flex-col items-center gap-1.5 opacity-70 text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">
          <span>Scroll to explore models</span>
          <span className="animate-bounce text-sm text-[#0795CF]">&darr;</span>
        </div>
      </div>
    </section>
  );
}
