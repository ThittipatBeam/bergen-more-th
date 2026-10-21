import { InteractiveTitle } from "@/components/ui/InteractiveTitle";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-32 sm:pt-36 md:pt-40 pb-16 px-6 sm:px-8">
      {/* 1. Cloudy Sky Gradient & Soft Grid Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white via-[#f0f8fc] to-[#eaf6fb] dark:from-[#0c1218] dark:via-[#111a22] dark:to-[#16222c] transition-colors duration-300"
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#f7fbfd_85%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_30%,#0c1218_85%)] transition-colors duration-300" />
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
        {/* SIAM.AI Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#DCEAF1] dark:border-[#1e3344] bg-white/90 dark:bg-[#111a22]/90 text-[#102A3A] dark:text-[#f0f7fb] text-xs sm:text-sm font-medium tracking-wide mb-6 sm:mb-8 shadow-xs backdrop-blur-xs transition-colors">
          <span className="inline-block w-2 h-2 rounded-full bg-[#0795CF] animate-pulse" />
          <span className="font-semibold text-[#0795CF]">SIAM.AI Benchmark</span>
          <span className="text-[#607786] dark:text-[#6b8293]">•</span>
          <span>Thai Corpus & Retrieval Evaluation</span>
          <span aria-hidden="true" className="text-[#0795CF] font-sans">
            &rarr;
          </span>
        </div>

        {/* Headline */}
        <InteractiveTitle
          text="Thai RAG & Embedding Leaderboard"
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl"
        />

        {/* Subtitle */}
        <p className="mt-5 sm:mt-6 max-w-xl text-center text-sm sm:text-base md:text-lg text-[#496273] dark:text-[#94abbc] font-sans font-normal leading-relaxed transition-colors">
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
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-[#DCEAF1] dark:border-[#1e3344] bg-white/80 dark:bg-[#111a22]/80 hover:bg-[#F0F8FC] dark:hover:bg-[#16222c] text-[#102A3A] dark:text-[#f0f7fb] text-sm font-medium transition-all shadow-xs"
          >
            SIAM.AI Cloud
          </a>
        </div>

        {/* Subtle scroll cue indicator */}
        <div className="mt-12 sm:mt-14 flex flex-col items-center gap-1.5 opacity-70 text-xs font-mono tracking-widest uppercase text-[#607786] dark:text-[#94abbc]">
          <span>Scroll to explore models</span>
          <span className="animate-bounce text-sm text-[#0795CF]">&darr;</span>
        </div>
      </div>
    </section>
  );
}
