export function HeroBackdrop() {
  return (
    <>
      {/* Canvas backdrop & soft grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[var(--background-canvas)] dark:bg-gradient-to-br dark:from-[var(--background-canvas)] dark:via-[var(--background-subtle)] dark:to-[var(--surface-brand)] transition-colors duration-300"
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--hero-grid) 1px, transparent 1px),
              linear-gradient(to bottom, var(--hero-grid) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background-canvas)_85%)] transition-colors duration-300" />
      </div>
    </>
  );
}
