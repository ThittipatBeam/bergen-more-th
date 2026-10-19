import { InteractiveTitle } from "@/components/ui/InteractiveTitle";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-32 sm:pt-36 md:pt-40 pb-16 px-6 sm:px-8">
      {/* 1. Square Notebook / Graph Paper Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[#fbfcfd]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(14, 116, 244, 0.055) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(14, 116, 244, 0.055) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      >
        {/* Soft radial fade so grid gently recedes towards screen edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#fbfcfd_90%)]" />
      </div>

      {/* 2. Technical Concentric Linework / Spiral Geometric Accents (Zed theme vibe) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.07] overflow-hidden"
      >
        <div className="relative w-[850px] h-[850px]">
          <div className="absolute inset-10 border border-blue-900 rotate-1 rounded-2xl" />
          <div className="absolute inset-20 border border-blue-900 -rotate-2 rounded-2xl" />
          <div className="absolute inset-32 border border-blue-900 rotate-3 rounded-2xl" />
          <div className="absolute inset-44 border border-blue-900 -rotate-1 rounded-2xl" />
          <div className="absolute inset-56 border border-blue-900 rotate-2 rounded-2xl" />
        </div>
      </div>

      {/* 3. Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Announcement Pill (Zed style top pill) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200/90 bg-blue-50/80 text-blue-950 text-xs sm:text-sm font-medium tracking-wide mb-6 sm:mb-8 shadow-xs backdrop-blur-xs">
          <span className="font-semibold text-[#0c57fb]">Leaderboard:</span>
          <span>Comprehensive evaluation for Thai retrieval models</span>
          <span aria-hidden="true" className="text-[#0c57fb] font-sans">
            &rarr;
          </span>
        </div>

        {/* Refined Headline: Sized down for better balance */}
        <InteractiveTitle
          text="Thai RAG Benchmark Leaderboard"
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl"
        />

        {/* Short Subtitle / Description below header */}
        <p className="mt-5 sm:mt-6 max-w-lg text-center text-sm sm:text-base md:text-lg text-neutral-600 font-sans font-normal leading-relaxed">
          A standardized open benchmark evaluating retrieval-augmented generation
          and embedding models across diverse Thai NLP tasks.
        </p>

        {/* Subtle scroll cue indicator */}
        <div className="mt-10 sm:mt-12 flex flex-col items-center gap-2 opacity-60 text-xs font-mono tracking-widest uppercase text-neutral-500">
          <span>Scroll to explore</span>
          <span className="animate-bounce text-sm">&darr;</span>
        </div>
      </div>
    </section>
  );
}
