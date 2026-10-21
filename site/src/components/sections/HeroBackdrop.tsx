export function HeroBackdrop() {
  return (
    <>
      {/* Cloudy sky gradient & soft grid */}
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background-canvas)_85%)] transition-colors duration-300" />
      </div>

      {/* Architectural sky rings */}
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
    </>
  );
}
