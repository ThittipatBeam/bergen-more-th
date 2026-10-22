import katex from "katex";

interface MathFormulaProps {
  tex: string;
  /** Accessible name for the scrollable region, e.g. "Precision formula". */
  label: string;
  className?: string;
}

/**
 * Server-rendered KaTeX. Rendering happens during the build/SSR pass, so the
 * KaTeX JavaScript never reaches the browser bundle and the formula is present
 * on first paint. `htmlAndMathml` keeps KaTeX's MathML for screen readers while
 * its visual spans stay aria-hidden.
 */
export function MathFormula({ tex, label, className = "" }: MathFormulaProps) {
  const html = katex.renderToString(tex, {
    displayMode: true,
    throwOnError: false,
    output: "htmlAndMathml",
    strict: "warn",
  });

  return (
    <figure className={`min-w-0 ${className}`}>
      <div
        role="region"
        aria-label={`${label}, scrollable`}
        tabIndex={0}
        className="formula-surface min-w-0 max-w-full overflow-x-auto overscroll-x-contain touch-pan-x px-1 py-1.5 text-[var(--text-primary)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
