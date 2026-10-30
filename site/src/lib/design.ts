/**
 * The site's layout and type scale. Every page composes from these so the
 * masthead, gutters, reading measure and card rhythm stay identical.
 *
 * Type hierarchy:
 *   kicker → h1 (page masthead) → h2 (section) → h3 (subsection)
 *   lead (page intro) → body (paragraphs) → small (notes, captions)
 */

/** Horizontal gutter. Same at every breakpoint as the navbar and footer. */
export const PAGE_GUTTER = "px-4 sm:px-6 md:px-10";

/** Reading column shared by About, Methodology, Metrics and Request. */
export const PAGE_SHELL = `mx-auto flex w-full max-w-4xl flex-col gap-12 ${PAGE_GUTTER} pt-28 pb-20 sm:gap-16`;

/** Wide column for the navbar, footer and home hero; edges line up at every width. */
export const WIDE_SHELL = `mx-auto w-full max-w-7xl ${PAGE_GUTTER}`;

/** Full-width column for the leaderboard table. */
export const DATA_SHELL = `mx-auto w-full max-w-[1600px] ${PAGE_GUTTER}`;

/** One card shell: same radius, border, surface and padding everywhere. */
export const CARD =
  "rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 transition-colors sm:p-8";

/** Type scale. */
export const KICKER = "font-mono text-xs font-bold uppercase tracking-wider";
export const H1 = "font-sans text-4xl font-bold tracking-[-0.02em] sm:text-5xl";
export const H2 = "font-sans text-2xl font-bold tracking-tight sm:text-3xl";
export const H3 = "font-sans text-lg font-bold tracking-tight sm:text-xl";
export const LEAD = "font-sans text-base leading-7 sm:text-lg";
export const BODY = "font-sans text-base leading-7";
export const SMALL = "font-sans text-sm leading-relaxed";
export const META = "font-mono text-xs";

/** Reading measures: choose by content role, not by eye. */
export const MEASURE_LEAD = "max-w-[56ch]";
export const MEASURE_BODY = "max-w-[62ch]";
export const MEASURE_NOTE = "max-w-[52ch]";

/** Action buttons. Same height, radius and padding wherever a CTA appears. */
export const BUTTON_PRIMARY =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--brand-cta)] px-6 font-sans text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[var(--brand-cta-hover)]";
export const BUTTON_SECONDARY =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] px-6 font-sans text-sm font-semibold text-[var(--text-primary)] shadow-2xs transition-colors hover:bg-[var(--background-subtle)]";
