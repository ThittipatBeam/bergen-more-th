import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-[var(--border-default)] bg-[var(--background-primary)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <Image
            src="/brand-mark.png"
            alt="SIAM.AI"
            width={279}
            height={140}
            unoptimized
            className="h-7 w-auto shrink-0 self-center dark:hidden"
          />
          <Image
            src="/brand-mark-white.png"
            alt=""
            aria-hidden="true"
            width={279}
            height={140}
            unoptimized
            className="hidden h-7 w-auto shrink-0 self-center dark:block"
          />
          <span
            aria-hidden="true"
            className="h-7 w-px shrink-0 self-center bg-[var(--border-default)]"
          />
          <p className="text-sm font-sans text-[var(--text-muted)] max-w-md leading-relaxed">
            SIAM.AI Thai RAG Benchmark — open evaluation of Thai
            retrieval-augmented generation pipelines. New runs are published as
            they complete.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-sans">
          <Link
            href="/#leaderboard"
            className="inline-flex items-center min-h-[44px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            href="/metrics"
            className="inline-flex items-center min-h-[44px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Metrics
          </Link>
          <Link
            href="/methodology"
            className="inline-flex items-center min-h-[44px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Methodology
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center min-h-[44px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            About
          </Link>
          <Link
            href="/request"
            className="inline-flex items-center min-h-[44px] font-semibold text-[var(--brand-text)] hover:text-[var(--brand-cta-hover)] transition-colors"
          >
            Request a run &rarr;
          </Link>
        </nav>
      </div>
    </footer>
  );
}
